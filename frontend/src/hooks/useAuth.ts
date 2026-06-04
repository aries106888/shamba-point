import { useState, useCallback } from "react";
import api from "@/api/client";

export interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: "farmer" | "buyer" | "admin";
  county?: string;
  location?: string;
  avatar_initials?: string;
}

function readUser(): User | null {
  try {
    const s = localStorage.getItem("shamba_user");
    return s ? (JSON.parse(s) as User) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("shamba_token")
  );
  const [user, setUser] = useState<User | null>(readUser);

  const login = useCallback(
    async (phone: string, password: string): Promise<void> => {
      const data = await api.post<{ token: string; user: User }>(
        "auth?action=login",
        { phone, password },
        { auth: false }
      );
      localStorage.setItem("shamba_token", data.token);
      localStorage.setItem("shamba_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    },
    []
  );

  const register = useCallback(
    async (payload: {
      name: string;
      phone: string;
      password: string;
      role: string;
      county?: string;
      location?: string;
    }): Promise<void> => {
      const data = await api.post<{ token: string; user: User }>(
        "auth?action=register",
        payload,
        { auth: false }
      );
      localStorage.setItem("shamba_token", data.token);
      localStorage.setItem("shamba_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("shamba_token");
    localStorage.removeItem("shamba_user");
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, login, register, logout, isLoggedIn: !!token };
}
