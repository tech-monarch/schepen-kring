import axios from "axios";

const isLocal =
  typeof window !== "undefined" && window.location.hostname === "localhost";
const BASE_URL = isLocal
  ? "https://schepen-kring.nl/api"
  : "https://schepen-kring.nl/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    // Remove "Content-Type" here; Axios will auto-set it for JSON or FormData
  },
});

// This "Interceptor" runs BEFORE every single request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
