import { axios, API_URL } from "./client";

export const meApi = {
  get: () => axios.get(`${API_URL}/me`),
};

export default meApi;
