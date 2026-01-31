// Token management utilities
import { API_CONFIG, getApiUrl, getApiHeaders } from "@/lib/api-config";

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "user_data";

export const tokenUtils = {
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken: (token?: string): string | null => {
    if (token) return token;
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  setUser: (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      window.dispatchEvent(
        new CustomEvent("userDataUpdated", { detail: user }),
      );
    }
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  isAuthenticated: (): boolean => !!tokenUtils.getToken(),

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
      if (response.ok) return true;
      tokenUtils.removeToken();
      return false;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  },

  logout: () => {
    tokenUtils.removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/nl/login";
    }
  },
};

// API request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = tokenUtils.getToken();
  const defaultHeaders: HeadersInit = { ...getApiHeaders(token || undefined) };
  const config: RequestInit = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  };

  try {
    const fullUrl = getApiUrl(endpoint);
    const response = await fetch(fullUrl, config);
    const data = await response.json();

    // Always check if response.ok
    if (!response.ok) throw new Error(data.message || "API request failed");

    return data; // return raw backend JSON
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Transform backend user data for frontend
const transformUserData = (user: any) => ({
  id: user.uuid || user.id, // frontend uses UUID as id, fallback to numeric ID
  mainId: user.id, // backend numeric ID
  uuid: user.uuid || user.id, // use uuid if available, otherwise use id
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  userType: user.userType ?? "client",
  token: user.token ?? null,
  role: user.role, // include role information
});

export const authAPI = {
  login: async (email: string, password: string, remember: boolean) => {
    const response: any = await apiRequest("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember }),
    });

    // Handle 2FA response separately
    if (response.status === "2FA_REQUIRED") {
      return {
        status: "2FA_REQUIRED",
        message: response.message,
        email: response.email,
        uuid: response.uuid,
      };
    }

    // Normal login - handle the specific response format
    if (response && response.data && response.data.user) {
      console.log("🔑 Login response received:", {
        hasData: !!response.data,
        hasUser: !!response.data.user,
        hasToken: !!response.data.token,
        token: response.data.token ? "Token received" : "No token",
        user: response.data.user,
      });

      // Pass the token to the user data
      const userWithToken = {
        ...response.data.user,
        token: response.data.token,
      };
      const transformedUser = transformUserData(userWithToken);
      tokenUtils.setUser(transformedUser);
      if (response.data.token) {
        tokenUtils.setToken(response.data.token);
        console.log("✅ Token stored successfully");
      } else {
        console.error("❌ No token received from server");
      }
      return transformedUser;
    }

    throw new Error("Invalid login response");
  },

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
    const response: any = await apiRequest(endpoint, {
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

    if (response && response.data && response.data.user) {
      console.log("🔑 Register response received:", {
        hasData: !!response.data,
        hasUser: !!response.data.user,
        hasToken: !!response.data.token,
        token: response.data.token ? "Token received" : "No token",
        user: response.data.user,
      });

      // Pass the token to the user data
      const userWithToken = {
        ...response.data.user,
        token: response.data.token,
      };
      const transformedUser = transformUserData(userWithToken);
      tokenUtils.setUser(transformedUser);
      if (response.data.token) {
        tokenUtils.setToken(response.data.token);
        console.log("✅ Token stored successfully");
      } else {
        console.error("❌ No token received from server");
      }
      return transformedUser;
    }

    throw new Error("Invalid register response");
  },

  registerPartner: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    referral_token?: string;
  }) => authAPI.register({ ...data, userType: "partner" }),
};
