import { axios, API_URL } from "./client";

export const tokensApi = {
  listTypes: () => axios.get(`${API_URL}/tokens/types`),
  listTypesFlat: () => axios.get(`${API_URL}/tokens/types/flat`),
  list: () => axios.get(`${API_URL}/tokens`),
  count: () => axios.get(`${API_URL}/tokens/count`),
  getByValue: (token) => axios.get(`${API_URL}/tokens/id/${token}`),
  getLogs: (token) => axios.get(`${API_URL}/tokens/${token}/logs`),
  getStats: (token) => axios.get(`${API_URL}/tokens/${token}/stats`),
  create: (formData) =>
    axios.post(`${API_URL}/tokens`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (token) => axios.delete(`${API_URL}/tokens/${token}`),
  rotate: (token, reason) =>
    axios.post(`${API_URL}/tokens/${token}/rotate`, { reason }),
  expire: (token) => axios.post(`${API_URL}/tokens/${token}/expire`),
  revoke: (token) => axios.post(`${API_URL}/tokens/${token}/revoke`),
  updateTags: (token, tags) =>
    axios.patch(`${API_URL}/tokens/${token}/tags`, { tags }),
  exportTokens: (format = "json") =>
    axios.get(`${API_URL}/tokens/export`, {
      params: { format },
      responseType: "blob",
    }),
};

export default tokensApi;
