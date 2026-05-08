"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { refreshToken as apiRefresh, getMe } from "@/lib/auth";

interface User {
  id: number;
  email: string;
  phone: string;
  account_type: string | null;
  registration_step: number;
  kyc_status: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (access: string, refresh: string, user: User) => void;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenVal, setRefreshTokenVal] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback((access: string, refresh: string) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(async () => {
      const data = await apiRefresh(refresh);
      if (data.access) {
        setAccessToken(data.access);
        localStorage.setItem('access_token', data.access);
        document.cookie = `access_token=${data.access}; path=/; max-age=${60 * 60}; SameSite=Lax`;
        scheduleRefresh(data.access, data.refresh ?? refresh);
      }
    }, 55 * 60 * 1000);
  }, []);

  const login = useCallback((access: string, refresh: string, userData: User) => {
    setAccessToken(access);
    setRefreshTokenVal(refresh);
    setUser(userData);
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    document.cookie = `access_token=${access}; path=/; max-age=${60 * 60}; SameSite=Lax`;
    scheduleRefresh(access, refresh);
  }, [scheduleRefresh]);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshTokenVal(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...partial } : prev);
  }, []);

  useEffect(() => {
    const access  = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (!access || !refresh) { setLoading(false); return; }

    getMe(access)
      .then(data => {
        if (data.id) {
          setAccessToken(access);
          setRefreshTokenVal(refresh);
          setUser(data);
          scheduleRefresh(access, refresh);
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      })
      .finally(() => setLoading(false));
  }, [scheduleRefresh]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      refreshToken: refreshTokenVal,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
