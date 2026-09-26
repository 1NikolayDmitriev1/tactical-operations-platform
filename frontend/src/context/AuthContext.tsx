import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { apiRequest } from "../api/client";

interface AuthContextType {
  isAuth: boolean;
  token: string | null;
  username: string | null;
  login: (username: string, password: string, api?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem("username"),
  );
  const isAuth = !!token;

  const login = async (
    username: string,
    password: string,
    api: string = "/auth/login",
  ) => {
    const response = await apiRequest(api, "POST", {
      body: { user_name: username, password },
    });
    if (response?.token) {
      localStorage.setItem("token", response.token);
      setToken(response.token);
      localStorage.setItem("username", username);
      setUsername(username);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    localStorage.removeItem("username");
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuth, token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
