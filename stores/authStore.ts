import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { create } from "zustand";
import type { User } from "@/interfaces";

interface AuthState {
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, authToken?: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      user: null,
      authToken: null,
      isAuthenticated: false,
      setAuth: (user: User, authToken?: string) => {
        set({
          user,
          authToken: authToken !== undefined ? authToken : null,
          isAuthenticated: true,
        });
        if (authToken !== undefined) {
          localStorage.setItem("auth_token", authToken);
        }
      },
      clearAuth: () => {
        set({ user: null, authToken: null, isAuthenticated: false });
        localStorage.removeItem("auth_token");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage as StateStorage),
    }
  )
);
