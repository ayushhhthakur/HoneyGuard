import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrg } from '../middleware/org.js';

const router = Router();
router.use(requireAuth, requireOrg);

const groupByDay = (rows, dateField) =>
  rows.reduce((acc, row) => {
    const date = new Date(row[dateField]).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

// GET /stats/logs?timeRange=24h&level=success — org-wide log feed, shaped
// for the Logs page (level/message/source instead of raw event/status/token)
router.get('/logs', async (req, res) => {
  const { timeRange = '24h', level } = req.query;

  const rangeMs = { '1h': 3600e3, '24h': 86400e3, '7d': 7 * 86400e3, '30d': 30 * 86400e3 }[timeRange] || 86400e3;
  const since = new Date(Date.now() - rangeMs).toISOString();

  const { data, error } = await supabaseAdmin
    .from('token_logs')
    .select('*')
    .eq('org_id', req.org.id)
    .gte('timestamp', since)
    .order('timestamp', { ascending: false })
    .limit(500);

  if (error) return res.status(500).json({ success: false, error: error.message });

  const toLevel = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'success') return 'success';
    if (s === 'error' || s === 'fail' || s === 'failed') return 'error';
    if (s === 'warning') return 'warning';
    return 'info';
  };

  const shaped = data.map((log) => ({
    level: toLevel(log.status),
    message: `${log.event} — ${log.token}`,
    source: log.token,
    ip_address: log.ip_address || 'Unknown',
    timestamp: log.timestamp,
  }));

  const filtered = level ? shaped.filter((l) => l.level === level) : shaped;

  res.json({ success: true, data: filtered });
});

// GET /stats/summary — single call for the dashboard's headline numbers
router.get('/summary', async (req, res) => {
  try {
    const orgId = req.org.id;
    const [{ count: tokenCount }, { count: logCount }, { count: openAlerts }, { data: recentLogs }] =
      await Promise.all([
        supabaseAdmin.from('tokens').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
        supabaseAdmin.from('token_logs').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
        supabaseAdmin
          .from('alerts')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'open'),
        supabaseAdmin
          .from('token_logs')
          .select('ip_address')
          .eq('org_id', orgId)
          .order('timestamp', { ascending: false })
          .limit(500),
      ]);

    const uniqueAttackers = new Set((recentLogs || []).map((l) => l.ip_address).filter(Boolean)).size;

    res.json({
      success: true,
      data: {
        total_tokens: tokenCount || 0,
        total_logs: logCount || 0,
        open_alerts: openAlerts || 0,
        unique_attackers_recent: uniqueAttackers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /stats/tokens — tokens created per day
router.get('/tokens', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('tokens')
    .select('created_at')
    .eq('org_id', req.org.id)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ success: false, error: error.message });
  const grouped = groupByDay(data, 'created_at');
  res.json({ success: true, data: { labels: Object.keys(grouped), values: Object.values(grouped) } });
});

// GET /stats/activity — total log volume per day
router.get('/activity', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('token_logs')
    .select('timestamp, status')
    .eq('org_id', req.org.id)
    .order('timestamp', { ascending: true });

  if (error) return res.status(500).json({ success: false, error: error.message });

  const grouped = groupByDay(data.map((d) => ({ created_at: d.timestamp })), 'created_at');
  res.json({ success: true, data: { labels: Object.keys(grouped), values: Object.values(grouped) } });
});

// GET /stats/logs-count
router.get('/logs-count', async (req, res) => {
  const { count, error } = await supabaseAdmin
    .from('token_logs')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', req.org.id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data: count });
});

// GET /stats/map — unique attacker locations for the map view
router.get('/map', async (req, res) => {
  const [{ data: logs, error: logError }, { data: fingerprints, error: fpError }] = await Promise.all([
    supabaseAdmin
      .from('token_logs')
      .select('ip_address, country, city, region, timezone, isp, latitude, longitude, token, timestamp')
      .eq('org_id', req.org.id)
      .order('timestamp', { ascending: false })
      .limit(2000),
    supabaseAdmin
      .from('device_fingerprints')
      .select('ip_address, token, created_at')
      .eq('org_id', req.org.id)
      .order('created_at', { ascending: false })
      .limit(2000),
  ]);

  if (logError) return res.status(500).json({ success: false, error: logError.message });
  if (fpError) return res.status(500).json({ success: false, error: fpError.message });

  const isValidPoint = (row) =>
    row &&
    typeof row.latitude === 'number' &&
    typeof row.longitude === 'number' &&
    !Number.isNaN(row.latitude) &&
    !Number.isNaN(row.longitude) &&
    row.latitude !== 0 &&
    row.longitude !== 0;

  const zoneKeyFor = (row) => `${Number(row.latitude).toFixed(1)},${Number(row.longitude).toFixed(1)}`;

  const fingerprintCountsByIp = new Map();
  for (const fp of fingerprints || []) {
    const ip = fp.ip_address || 'Unknown';
    fingerprintCountsByIp.set(ip, (fingerprintCountsByIp.get(ip) || 0) + 1);
  }

  const zoneMap = new Map();
  for (const row of logs || []) {
    if (!isValidPoint(row)) continue;
    const key = zoneKeyFor(row);
    if (!zoneMap.has(key)) {
      zoneMap.set(key, {
        zone_key: key,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        ip_addresses: new Set(),
        fingerprints: 0,
        events: 0,
        countries: new Set(),
        cities: new Set(),
        regions: new Set(),
        isps: new Set(),
        samples: [],
      });
    }

    const zone = zoneMap.get(key);
    zone.ip_addresses.add(row.ip_address || 'Unknown');
    if (row.city) zone.cities.add(row.city);
    if (row.country) zone.countries.add(row.country);
    if (row.region) zone.regions.add(row.region);
    if (row.isp) zone.isps.add(row.isp);
    if (row.timestamp || row.created_at) zone.samples.push(row);
    zone.events += 1;
    zone.fingerprints += fingerprintCountsByIp.get(row.ip_address || 'Unknown') || 0;
  }

  const zones = Array.from(zoneMap.values())
    .map((zone) => {
      const ipCount = zone.ip_addresses.size;
      const hitCount = zone.events + zone.fingerprints;
      const severity = hitCount >= 5 || ipCount >= 4 ? 'critical' : hitCount >= 3 || ipCount >= 2 ? 'high' : 'moderate';
      return {
        zone_key: zone.zone_key,
        latitude: zone.latitude,
        longitude: zone.longitude,
        ip_count: ipCount,
        hit_count: hitCount,
        fingerprint_count: zone.fingerprints,
        event_count: zone.events,
        severity,
        is_red_zone: severity === 'high' || severity === 'critical',
        ip_addresses: Array.from(zone.ip_addresses),
        countries: Array.from(zone.countries),
        cities: Array.from(zone.cities),
        regions: Array.from(zone.regions),
        isps: Array.from(zone.isps),
        sample_points: zone.samples.slice(0, 10),
      };
    })
    .sort((a, b) => b.hit_count - a.hit_count || b.ip_count - a.ip_count);

  const locations = zones.flatMap((zone) =>
    zone.ip_addresses.map((ip_address) => ({
      ip_address,
      country: zone.countries[0] || 'Unknown',
      city: zone.cities[0] || 'Unknown',
      region: zone.regions[0] || 'Unknown',
      timezone: zone.sample_points[0]?.timezone || 'Unknown',
      isp: zone.isps[0] || 'Unknown',
      latitude: zone.latitude,
      longitude: zone.longitude,
      zone_key: zone.zone_key,
    }))
  );

  res.json({
    success: true,
    data: {
      zones,
      locations,
      totals: {
        points: locations.length,
        zones: zones.length,
        red_zones: zones.filter((zone) => zone.is_red_zone).length,
      },
    },
  });
});

export default router;
