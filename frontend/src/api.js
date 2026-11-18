const API_ORIGIN = import.meta.env.VITE_API_ORIGIN;
const API_URL = API_ORIGIN
  ? API_ORIGIN.replace(/\/$/, "") + "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("library_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = "Bearer " + token;

  const response = await fetch(API_URL + path, { ...options, headers });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("library_token");
      localStorage.removeItem("library_user");
      window.dispatchEvent(new Event("library:logout"));
    }
    throw new Error(data?.message || "The request could not be completed.");
  }
  return data;
}
