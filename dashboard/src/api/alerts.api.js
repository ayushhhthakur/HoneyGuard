import { axios, API_URL } from "./client";

export const alertsApi = {
  list: (params) => axios.get(`${API_URL}/alerts`, { params }),
  updateStatus: (id, status) =>
    axios.patch(`${API_URL}/alerts/${id}`, { status }),
};

export default alertsApi;
