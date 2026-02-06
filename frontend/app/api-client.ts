/**
 * API URL and axios client. Single file so the build does not depend on app/lib.
 */
import axios from "axios";

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || "";
  return url.replace(/\/$/, "") || "http://localhost:8000";
}

const client = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (typeof window !== "undefined" && err.response?.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith("/admin") && !path.endsWith("/login")) {
        localStorage.removeItem("access_token");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

/** Get current user ID from JWT (sub claim). Returns null if no token or invalid. */
export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export default client;
export const apiUrl = getApiUrl();
