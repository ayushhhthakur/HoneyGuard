import { ok } from '../core/ApiResponse.js';
import * as statsService from '../services/stats.service.js';

export const summary = async (req, res) => ok(res, await statsService.getSummary(req.org.id));
export const tokenSeries = async (req, res) => ok(res, await statsService.getTokenSeries(req.org.id));
export const activitySeries = async (req, res) => ok(res, await statsService.getActivitySeries(req.org.id));
export const logsCount = async (req, res) => ok(res, await statsService.getLogsCount(req.org.id));
export const logs = async (req, res) => ok(res, await statsService.getFormattedLogs(req.org.id, req.query));
export const map = async (req, res) => ok(res, await statsService.getAttackerMap(req.org.id));
export const threatScore = async (req, res) => ok(res, await statsService.getThreatScore(req.org.id));
export const categories = async (req, res) => ok(res, await statsService.getCategoryBreakdown(req.org.id));
export const countries = async (req, res) => ok(res, await statsService.getCountryBreakdown(req.org.id));
export const mitre = async (req, res) => ok(res, await statsService.getMitreBreakdown(req.org.id, req.query.timeRange));
export const recentEvents = async (req, res) => ok(res, await statsService.getRecentEvents(req.org.id));
export const dashboard = async (req, res) => ok(res, await statsService.getDashboardBundle(req.org.id));

export default {
  summary,
  tokenSeries,
  activitySeries,
  logsCount,
  logs,
  map,
  threatScore,
  categories,
  countries,
  mitre,
  recentEvents,
  dashboard,
};
