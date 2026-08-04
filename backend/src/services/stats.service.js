import { tokensRepository } from '../repositories/tokens.repository.js';
import { tokenLogsRepository } from '../repositories/tokenLogs.repository.js';
import { alertsRepository } from '../repositories/alerts.repository.js';
import { EVENT_MITRE_TACTIC } from '../config/constants.js';

const groupByDay = (rows, dateField) =>
  rows.reduce((acc, row) => {
    const date = new Date(row[dateField]).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

const asSeries = (grouped) => ({ labels: Object.keys(grouped), values: Object.values(grouped) });

const RANGE_MS = { '1h': 3600e3, '24h': 86400e3, '7d': 7 * 86400e3, '30d': 30 * 86400e3 };

const toLevel = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'success') return 'success';
  if (['error', 'fail', 'failed'].includes(s)) return 'error';
  if (s === 'warning') return 'warning';
  return 'info';
};

export const getSummary = async (orgId) => {
  const [tokenCount, logCount, openAlerts, recentLogs] = await Promise.all([
    tokensRepository.countByOrg(orgId),
    tokenLogsRepository.countByOrg(orgId),
    alertsRepository.countOpenByOrg(orgId),
    tokenLogsRepository.recentIpsByOrg(orgId, 500),
  ]);

  const uniqueAttackers = new Set(recentLogs.map((l) => l.ip_address).filter(Boolean)).size;

  return {
    total_tokens: tokenCount,
    total_logs: logCount,
    open_alerts: openAlerts,
    unique_attackers_recent: uniqueAttackers,
  };
};

export const getTokenSeries = async (orgId) => asSeries(groupByDay(await tokensRepository.createdAtSeries(orgId), 'created_at'));

export const getActivitySeries = async (orgId) => {
  const rows = await tokenLogsRepository.timestampSeries(orgId);
  return asSeries(groupByDay(rows.map((r) => ({ created_at: r.timestamp })), 'created_at'));
};

export const getLogsCount = (orgId) => tokenLogsRepository.countByOrg(orgId);

export const getFormattedLogs = async (orgId, { timeRange = '24h', level } = {}) => {
  const since = new Date(Date.now() - (RANGE_MS[timeRange] || RANGE_MS['24h'])).toISOString();
  const rows = await tokenLogsRepository.listByOrgSince(orgId, since, 500);

  const shaped = rows.map((row) => ({
    level: toLevel(row.status),
    message: `${row.event} — ${row.token}`,
    source: row.token,
    ip_address: row.ip_address || 'Unknown',
    timestamp: row.timestamp,
  }));

  return level ? shaped.filter((l) => l.level === level) : shaped;
};

export const getAttackerMap = async (orgId) => {
  const logs = await tokenLogsRepository.geoPointsByOrg(orgId, 2000);
  const uniqueByIp = new Map();
  for (const entry of logs) {
    if (entry.ip_address && !uniqueByIp.has(entry.ip_address) && entry.latitude != null && entry.longitude != null) {
      uniqueByIp.set(entry.ip_address, entry);
    }
  }
  return Array.from(uniqueByIp.values());
};

/**
 * Composite 0-100 "threat score" for the org, built entirely from real
 * signals already in the database — no randomness, no placeholder value.
 * Each component is capped independently so no single signal can dominate,
 * and the breakdown is returned alongside the score so the UI can show
 * *why* it's that number (the way Defender's Exposure Score or a Splunk
 * risk score does) rather than presenting an opaque figure.
 *
 *   +8  per open alert          (capped at 40)
 *   +15 per open critical alert (capped at 30)
 *   +3  per unique recent attacker IP (capped at 20)
 *   +10 if event volume in the last hour exceeds the last-24h hourly average
 */
export const getThreatScore = async (orgId) => {
  const [openAlerts, severityRows, recentIps, lastHourEvents, last24hEvents] = await Promise.all([
    alertsRepository.countOpenByOrg(orgId),
    alertsRepository.openSeverityCounts(orgId),
    tokenLogsRepository.recentIpsByOrg(orgId, 500),
    tokenLogsRepository.listByOrgSince(orgId, new Date(Date.now() - 3600e3).toISOString(), 1000),
    tokenLogsRepository.listByOrgSince(orgId, new Date(Date.now() - 86400e3).toISOString(), 5000),
  ]);

  const criticalOpen = severityRows.filter((r) => r.severity === 'critical' || r.severity === 'high').length;
  const uniqueAttackers = new Set(recentIps.map((l) => l.ip_address).filter(Boolean)).size;
  const hourlyAverage = last24hEvents.length / 24;
  const isSpiking = lastHourEvents.length > Math.max(hourlyAverage * 1.5, 3);

  const alertComponent = Math.min(openAlerts * 8, 40);
  const criticalComponent = Math.min(criticalOpen * 15, 30);
  const attackerComponent = Math.min(uniqueAttackers * 3, 20);
  const velocityComponent = isSpiking ? 10 : 0;

  const score = Math.round(alertComponent + criticalComponent + attackerComponent + velocityComponent);

  return {
    score: Math.min(score, 100),
    level: score >= 70 ? 'critical' : score >= 45 ? 'high' : score >= 20 ? 'medium' : 'low',
    breakdown: [
      { label: 'Open alerts', value: openAlerts, contribution: alertComponent },
      { label: 'Critical/high alerts', value: criticalOpen, contribution: criticalComponent },
      { label: 'Unique attacker IPs', value: uniqueAttackers, contribution: attackerComponent },
      { label: 'Event velocity spike', value: isSpiking, contribution: velocityComponent },
    ],
  };
};

export const getCategoryBreakdown = async (orgId) => {
  const rows = await tokensRepository.categorySeries(orgId);
  const counts = rows.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Top attacker countries by observed volume — "high risk" here means
 * exactly what it means in any real SOC tool: where the most attack
 * traffic against YOUR honeytokens has actually originated, ranked by
 * observed frequency. Not a geopolitical watchlist.
 */
export const getCountryBreakdown = async (orgId, limit = 10) => {
  const rows = await tokenLogsRepository.countrySeries(orgId, 2000);
  const counts = rows.reduce((acc, r) => {
    const country = r.country && r.country !== 'Unknown' ? r.country : null;
    if (!country) return acc;
    if (!acc[country]) acc[country] = { country, count: 0, ips: new Set() };
    acc[country].count += 1;
    if (r.ip_address) acc[country].ips.add(r.ip_address);
    return acc;
  }, {});

  return Object.values(counts)
    .map((c) => ({ country: c.country, count: c.count, uniqueIps: c.ips.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getMitreBreakdown = async (orgId, timeRange = '7d') => {
  const since = new Date(Date.now() - (RANGE_MS[timeRange] || RANGE_MS['7d'])).toISOString();
  const rows = await tokenLogsRepository.eventSeries(orgId, since);

  const counts = rows.reduce((acc, r) => {
    const tactic = EVENT_MITRE_TACTIC[r.event] || 'Other';
    acc[tactic] = (acc[tactic] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([tactic, count]) => ({ tactic, count }))
    .sort((a, b) => b.count - a.count);
};

export const getRecentEvents = async (orgId, limit = 25) => {
  const rows = await tokenLogsRepository.recentEvents(orgId, limit);
  return rows.map((r) => ({
    id: r.id,
    token: r.token,
    tokenName: r.tokens?.token_name || r.token,
    category: r.tokens?.category || null,
    event: r.event,
    status: r.status,
    ipAddress: r.ip_address,
    country: r.country,
    city: r.city,
    browser: r.browser,
    os: r.os,
    device: r.device,
    timestamp: r.timestamp,
  }));
};

/**
 * Everything the redesigned dashboard needs, in one round trip — fewer
 * requests on first paint, one loading state instead of five.
 */
export const getDashboardBundle = async (orgId) => {
  const [summary, threat, categories, countries, mitre, recentEvents] = await Promise.all([
    getSummary(orgId),
    getThreatScore(orgId),
    getCategoryBreakdown(orgId),
    getCountryBreakdown(orgId),
    getMitreBreakdown(orgId),
    getRecentEvents(orgId, 10),
  ]);

  return { summary, threat, categories, countries, mitre, recentEvents };
};

export default {
  getSummary,
  getTokenSeries,
  getActivitySeries,
  getLogsCount,
  getFormattedLogs,
  getAttackerMap,
  getThreatScore,
  getCategoryBreakdown,
  getCountryBreakdown,
  getMitreBreakdown,
  getRecentEvents,
  getDashboardBundle,
};
