import { useState, useEffect } from "react";
import authApi from "../services/authApi";
import AuthContext from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from HTTP-only cookie on application mount
  useEffect(() => {
    let ignore = false;

    async function initSession() {
      try {
        const currentUser = await authApi.getMe();
        if (!ignore) {
          setUser(currentUser);
        }
      } catch {
        if (!ignore) {
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    initSession();

    return () => {
      ignore = true;
    };
  }, []);

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.data) {
      setUser(res.data);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout API notice:", err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
