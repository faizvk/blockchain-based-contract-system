import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Don't force-redirect on 401 from these endpoints — they're called by
// background hydration (auth/me) or by public pages, and slamming the user
// to /login mid-flow is worse than letting the caller decide.
const NO_REDIRECT_401 = ["/api/auth/me", "/api/auth/login", "/api/auth/register"];

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("authToken");
      const url = err.config?.url || "";
      const isSilent = NO_REDIRECT_401.some((p) => url.includes(p));
      if (
        !isSilent &&
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
