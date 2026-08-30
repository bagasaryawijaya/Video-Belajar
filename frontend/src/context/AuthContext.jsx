import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { signInWithGooglePopup } from "../services/firebaseClient";

const AuthContext = createContext();
const API_ROOT = (import.meta.env.VITE_API_URL || "/api/courses").replace(/\/courses\/?$/, "");

const authApi = axios.create({
  baseURL: `${API_ROOT}/auth`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

function getToken() {
  return localStorage.getItem("accessToken");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.get("/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        const current = response.data?.data;
        setUser(current);
        setIsLogin(Boolean(current));
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setUser(null);
        setIsLogin(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const register = async (data) => {
    try {
      const response = await authApi.post("/signup", data);
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Pendaftaran gagal.",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authApi.post("/login", { email, password });
      const result = response.data?.data;

      localStorage.setItem("accessToken", result.token);
      localStorage.setItem("loginUser", JSON.stringify(result.user));

      setUser(result.user);
      setIsLogin(true);

      return { success: true, user: result.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login gagal.",
      };
    }
  };


  const loginWithGoogle = async () => {
    try {
      const { idToken } = await signInWithGooglePopup();
      const response = await authApi.post("/google", { idToken });
      const result = response.data?.data;
      localStorage.setItem("accessToken", result.token);
      localStorage.setItem("loginUser", JSON.stringify(result.user));
      setUser(result.user);
      setIsLogin(true);
      return { success: true, user: result.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Login dengan Google gagal.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loginUser");
    setUser(null);
    setIsLogin(false);
  };

  const updateProfile = async () => ({
    success: false,
    message: "Update profil perlu endpoint backend tersendiri.",
  });

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  return (
    <AuthContext.Provider value={{
      user,
      isLogin,
      loading,
      isAdmin,
      isSuperAdmin,
      register,
      login,
      loginWithGoogle,
      logout,
      updateProfile,
      token: getToken(),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
