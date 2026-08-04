import { axios, API_URL } from "./client";

export const categoriesApi = {
  list: () => axios.get(`${API_URL}/categories`),
  create: (payload) => axios.post(`${API_URL}/categories`, payload),
  remove: (id) => axios.delete(`${API_URL}/categories/${id}`),
};

export default categoriesApi;
