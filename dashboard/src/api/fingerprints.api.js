import { axios, API_URL } from "./client";

export const fingerprintsApi = {
  list: (params) => axios.get(`${API_URL}/fingerprints`, { params }),
  getById: (id) => axios.get(`${API_URL}/fingerprints/${id}`),
};

export default fingerprintsApi;
