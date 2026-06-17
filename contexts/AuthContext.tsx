"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User } from "@/types";
import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setTokens,
  setStoredUser,
  clearAuth,
} from "@/lib/auth";
import {
  signupApi,
  loginApi,
  logoutApi,
  getMeApi,
  updateMeApi,
} from "@/lib/services/auth.service";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<string>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  setUserFromTokens: (accessToken: string, refreshToken: string, user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function rehydrate() {
      const token = getAccessToken();
      if (!token) {
        const stored = getStoredUser();
        if (stored) setUser(stored);
        setLoading(false);
        return;
      }

      try {
        const me = await getMeApi();
        setUser(me);
        setStoredUser(me);
      } catch {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          clearAuth();
        }
        const stored = getStoredUser();
        if (stored) setUser(stored);
      } finally {
        setLoading(false);
      }
    }

    rehydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginApi(email, password);
    setTokens(data.accessToken, data.refreshToken);
    setStoredUser(data.user);
    setUser(data.user);
  }, []);

  // Returns the email so the caller can redirect to /verify-email?email=...
  const signup = useCallback(
    async (email: string, password: string, name: string): Promise<string> => {
      const data = await signupApi(email, password, name);
      return data.email;
    },
    []
  );

  // Called after successful OTP verification
  const setUserFromTokens = useCallback(
    (accessToken: string, refreshToken: string, userData: User) => {
      setTokens(accessToken, refreshToken);
      setStoredUser(userData);
      setUser(userData);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      setStoredUser(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateUser, setUserFromTokens }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export { updateMeApi };
