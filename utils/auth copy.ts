// Token management utilities
import { API_CONFIG, getApiUrl, getApiHeaders } from "@/lib/api-config";

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "user_data";

export const tokenUtils = {
  // Store token in localStorage
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Get token from localStorage or from cookies
  getToken: (token?: string): string | null => {
    // If token is provided, use it (for server actions)
    if (token) return token;

    // Otherwise try to get from localStorage (client-side)
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Remove token from localStorage
  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Store user data
  setUser: (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Dispatch a custom event to notify all components
      window.dispatchEvent(
        new CustomEvent("userDataUpdated", { detail: user })
      );
    }
  },

  // Get user data
  getUser: () => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!tokenUtils.getToken();
  },

  // Validate token with server (optional - for extra security)
  validateToken: async (): Promise<boolean> => {
    const token = tokenUtils.getToken();
    if (!token) return false;

    try {
      const response = await fetch(getApiUrl("/validate"), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        return true;
      } else {
        // Token is invalid, remove it
        tokenUtils.removeToken();
        return false;
      }
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  },

  // Logout function
  logout: () => {
    tokenUtils.removeToken();
    // Redirect to signin page
    if (typeof window !== "undefined") {
      window.location.href = "/nl/login";
    }
  },
};

// API request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = tokenUtils.getToken();

  const defaultHeaders: HeadersInit = {
    ...getApiHeaders(token || undefined),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const fullUrl = getApiUrl(endpoint);
    const response = await fetch(fullUrl, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // Login
  login: async (email: string, password: string, remember: boolean) => {
    return apiRequest("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        remember,
      }),
    });
  },
  // Register (normal signup)
  register: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    userType?: string;
    referral_token?: string;
  }) => {
    const endpoint = data.referral_token
      ? `/register/${data.referral_token}`
      : "/register";

    return apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.password_confirmation,
        userType: data.userType || "client",
        ...(data.referral_token && { referral_token: data.referral_token }),
      }),
    });
  },

  // Partner register
  registerPartner: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    referral_token?: string;
  }) => {
    return authAPI.register({
      ...data,
      userType: "partner",
    });
  },
};
