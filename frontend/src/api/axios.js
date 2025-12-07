import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000",
});

// Interceptor: token + FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FormData → biarkan axios set sendiri
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});
