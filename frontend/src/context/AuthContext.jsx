import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on refresh
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const res = await API.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      console.log("Auth failed");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

  // Login
  const login = async (data) => {
    const res = await API.post("/auth/login", data);

    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // Register
  const register = async (data) => {
    const res = await API.post("/auth/register", data);

    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook (clean usage)
export const useAuth = () => useContext(AuthContext);