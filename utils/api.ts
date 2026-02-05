import axios from "axios";

// This helper determines the backend URL based on where the browser is looking
const getBaseUrl = () => {
  // 1. Priority: Manual override in .env
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  // 2. Auto-detect if in browser
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    // If you are on localhost, assume Laravel is also on localhost:8000
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "https://schepen-kring.nl/api";
    }
    // For production or local network testing (e.g. 192.168.1.50)
    return `https://${hostname}:8000/api`;
  }

  // 3. Fallback for Server Side Rendering
  return "https://schepen-kring.nl/api";
};

export const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
