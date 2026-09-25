import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, fetch the full profile.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function handleAuthSuccess({ token: newToken, user: newUser }) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function login(credentials) {
    const data = await authApi.login(credentials);
    handleAuthSuccess(data);
    return data;
  }

  async function register(payload) {
    const data = await authApi.register(payload);
    handleAuthSuccess(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  function updateUserLocally(patch) {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }

  const value = {
    token,
    user,
    loading,
    isAdmin: user?.role === "ADMIN",
    login,
    register,
    logout,
    updateUserLocally,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
