import React, { createContext, useContext, useState, useEffect } from "react";
import { AUTH_CONFIG } from "@/lib/config";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  membershipType?: string;
  status?: string;
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Response not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { token: newToken, user: newUser } = data;

      if (!newToken || !newUser) {
        throw new Error("Invalid server response: missing token or user data");
      }

      setToken(newToken);
      setUser(newUser);

      // Store based on rememberMe preference
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      storage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
      storage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(newUser));
      storage.setItem(AUTH_CONFIG.REMEMBER_ME_KEY, String(rememberMe));

      // Clear other storage
      otherStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      otherStorage.removeItem(AUTH_CONFIG.USER_KEY);
    } catch (error) {
      // Clear any partial auth state on error
      setToken(null);
      setUser(null);
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      sessionStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      sessionStorage.removeItem(AUTH_CONFIG.USER_KEY);
      
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      throw new Error(message);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        let errorMessage = "Registration failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Response not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { token: newToken, user: newUser } = data;

      if (!newToken || !newUser) {
        throw new Error("Invalid server response");
      }

      setToken(newToken);
      setUser(newUser);

      sessionStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
      sessionStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(newUser));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed. Please try again.";
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(updatedUser));
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
