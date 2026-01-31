// Token management utilities
import { API_CONFIG, getApiUrl, getApiHeaders } from "@/lib/api-config";

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "user_data";

/* =========================
   Types
========================= */

export type AuthUser = {
  id: any;
  mainId: any;
  uuid: any;
  name: string;
  email: string;
  phone: string | null;
  userType: string;
  token: string | null;
  role?: number;
  is_approved?: number;
};

export type RegisterResponse = AuthUser & {
  success?: boolean;
  message?: string;
};

/* =========================
   Token Utils
========================= */

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

/* =========================
   API Request Helper
========================= */

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = tokenUtils.getToken();
  const defaultHeaders: HeadersInit = {
    ...getApiHeaders(token || undefined),
  };

  const config: RequestInit = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
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

/* =========================
   Helpers
========================= */

const transformUserData = (user: any): AuthUser => ({
  id: user.uuid || user.id,
  mainId: user.id,
  uuid: user.uuid || user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  userType: user.userType ?? "client",
  token: user.token ?? null,
  role: Number(user.role) ?? 0,
  is_approved: Number(user.is_approved) ?? 3,
});

/* =========================
   Auth API
========================= */

export const authAPI = {
  login: async (
    email: string,
    password: string,
    remember: boolean,
  ): Promise<AuthUser | any> => {
    const response: any = await apiRequest("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember }),
    });

    if (response.status === "2FA_REQUIRED") {
      return {
        status: "2FA_REQUIRED",
        message: response.message,
        email: response.email,
        uuid: response.uuid,
      };
    }

    if (response?.data?.user) {
      const userWithToken = {
        ...response.data.user,
        token: response.data.token,
      };

      const transformedUser = transformUserData(userWithToken);

      tokenUtils.setUser(transformedUser);

      if (response.data.token) {
        tokenUtils.setToken(response.data.token);
      }

      return transformedUser;
    }

    throw new Error("Invalid login response");
  },

  // register: async (data: {
  //   name: string;
  //   email: string;
  //   phone: string;
  //   password: string;
  //   password_confirmation: string;
  //   userType?: string;
  //   referral_code?: string;
  // }): Promise<RegisterResponse> => {
  //   const endpoint = data.referral_code
  //     ? `/signup/${data.referral_code}`
  //     : "/signup";

  //   const response: any = await apiRequest(endpoint, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       name: data.name,
  //       email: data.email,
  //       phone: data.phone,
  //       password: data.password,
  //       password_confirmation: data.password_confirmation,
  //       userType: data.userType || "client",
  //       ...(data.referral_code && {
  //         referral_code: data.referral_code,
  //       }),
  //     }),
  //   });

  //   if (!response) {
  //     throw new Error("Invalid register response");
  //   }

  //   const userData = response.data?.user ?? response.data ?? null;
  //   const token = response.data?.token ?? response.token ?? null;

  //   let transformedUser: AuthUser | null = null;

  //   if (userData) {
  //     transformedUser = transformUserData({
  //       ...userData,
  //       token,
  //     });

  //     if (token) {
  //       tokenUtils.setUser(transformedUser);
  //       tokenUtils.setToken(token);
  //     }
  //   }

  //   return {
  //     ...(transformedUser ?? {}),
  //     success: response.success,
  //     message: response.message,
  //   } as RegisterResponse;
  // },

register: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    role: number; // 0 for User, 2 for Merchant
    gender: string;  
    city: string;
    referral_code?: string | null;
}): Promise<RegisterResponse> => {
    
    // We can keep the endpoint simple since we're passing the code in the body
    const endpoint = "/register";

    const response: any = await apiRequest(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: data.role,
        gender: data.gender, // Added this line to send to backend
        city: data.city,
        referral_code: data.referral_code, // <-- YOU MUST ADD THIS LINE HERE
      }),
    });

    if (!response) {
      throw new Error("Invalid register response");
    }

    const userData = response.data?.user ?? response.data ?? null;
    const token = response.data?.token ?? response.token ?? null;

    let transformedUser: AuthUser | null = null;

    if (userData) {
      transformedUser = transformUserData({
        ...userData,
        token,
      });

      if (token) {
        tokenUtils.setUser(transformedUser);
        tokenUtils.setToken(token);
      }
    }

    return {
      ...(transformedUser ?? {}),
      success: response.success,
      message: response.message,
    } as RegisterResponse;
},
  registerPartner: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    gender: string; // Add this
    city: string;   // Add this
    referral_code?: string;
  }): Promise<RegisterResponse> => {
    return authAPI.register({ ...data, role: 2, gender: data.gender, city: data.city });
  },
};
