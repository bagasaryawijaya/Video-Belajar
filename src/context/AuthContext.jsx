import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const loginUser = JSON.parse(localStorage.getItem("loginUser"));

    if (loginUser) {
      setUser(loginUser);
      setIsLogin(true);
    }
  }, []);

  const register = (data) => {
    localStorage.setItem("registeredUser", JSON.stringify(data));
  };

  const login = (email, password) => {
    const registeredUser = JSON.parse(
      localStorage.getItem("registeredUser")
    );

    if (!registeredUser) {
      return {
        success: false,
        message: "Silakan daftar terlebih dahulu.",
      };
    }

    if (
      registeredUser.email === email &&
      registeredUser.password === password
    ) {
      localStorage.setItem(
        "loginUser",
        JSON.stringify(registeredUser)
      );

      setUser(registeredUser);
      setIsLogin(true);

      return {
        success: true,
      };
    }

    return {
      success: false,
      message: "Email atau password salah.",
    };
  };

  const logout = () => {
    localStorage.removeItem("loginUser");
    setUser(null);
    setIsLogin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLogin,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}