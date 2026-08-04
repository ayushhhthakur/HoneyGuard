import axios from "axios";
import { supabase } from "./supabaseClient";

// Simple in-memory pointer to the active org, updated by AuthContext whenever
// the user switches orgs. Read synchronously here so the interceptor doesn't
// need an extra async hop just to attach a header.
let activeOrgId = null;
export const setActiveOrgId = (orgId) => {
  activeOrgId = orgId;
};
export const getActiveOrgId = () => activeOrgId;

// This attaches to the default axios export, which is the SAME module
// instance every other file in the app imports via `import axios from 'axios'`
// — so every existing view's axios.get/post/delete call gets the auth +
// org headers for free without having to touch each file individually.
axios.interceptors.request.use(async (config) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const isBackendRequest = config.url?.startsWith(apiUrl);

  if (isBackendRequest) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (activeOrgId) {
      config.headers = config.headers || {};
      config.headers["x-org-id"] = activeOrgId;
    }
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session is gone/expired — let AuthContext's onAuthStateChange
      // listener handle the redirect rather than forcing one here, so we
      // don't fight in-flight requests during normal token refresh.
      // eslint-disable-next-line no-console
      console.warn("Request unauthorized:", error.config?.url);
    }
    return Promise.reject(error);
  },
);

export default axios;
