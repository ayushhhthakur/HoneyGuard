import { axios, API_URL } from "./client";

export const statsApi = {
  summary: () => axios.get(`${API_URL}/stats/summary`),
  dashboard: () => axios.get(`${API_URL}/stats/dashboard`),
  threatScore: () => axios.get(`${API_URL}/stats/threat-score`),
  categories: () => axios.get(`${API_URL}/stats/categories`),
  countries: () => axios.get(`${API_URL}/stats/countries`),
  mitre: (timeRange) =>
    axios.get(`${API_URL}/stats/mitre`, { params: { timeRange } }),
  recentEvents: () => axios.get(`${API_URL}/stats/recent-events`),
  tokenSeries: () => axios.get(`${API_URL}/stats/tokens`),
  activitySeries: () => axios.get(`${API_URL}/stats/activity`),
  logsCount: () => axios.get(`${API_URL}/stats/logs-count`),
  logs: (params) => axios.get(`${API_URL}/stats/logs`, { params }),
  map: () => axios.get(`${API_URL}/stats/map`),
};

export default statsApi;
