import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const USERS_KEY = "registeredUsers";

const DEFAULT_ADMIN = {
  nama: "Administrator",
  email: "admin@videobelajar.com",
  password: "admin123",
  role: "admin",
  profileImage: "",
};

const getUsers = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY));

    if (Array.isArray(saved)) {
      const users = saved.map((item) => ({
        ...item,
        profileImage: item.profileImage || "",
      }));

      if (!users.some((item) => item.email === DEFAULT_ADMIN.email)) {
        users.push(DEFAULT_ADMIN);
      }

      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return users;
    }
  } catch {
    // migrate below
  }

  let oldUser = null;

  try {
    oldUser = JSON.parse(localStorage.getItem("registeredUser"));
  } catch {
    oldUser = null;
  }

  const users = oldUser
    ? [
        {
          ...oldUser,
          role: oldUser.role || "user",
          profileImage: oldUser.profileImage || "",
        },
        DEFAULT_ADMIN,
      ]
    : [DEFAULT_ADMIN];

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const users = getUsers();

    try {
      const loginUser = JSON.parse(localStorage.getItem("loginUser"));

      if (loginUser) {
        const freshUser =
          users.find((item) => item.email === loginUser.email) ||
          loginUser;

        setUser(freshUser);
        setIsLogin(true);
        localStorage.setItem("loginUser", JSON.stringify(freshUser));
      }
    } catch {
      localStorage.removeItem("loginUser");
    }
  }, []);

  const register = (data) => {
    const users = getUsers();

    const exists = users.some((item) => item.email === data.email);

    if (exists) {
      return {
        success: false,
        message: "Email sudah terdaftar.",
      };
    }

    const newUser = {
      ...data,
      role: "user",
      profileImage: data.profileImage || "",
    };

    const updated = [...users, newUser];

    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    localStorage.setItem("registeredUser", JSON.stringify(newUser));

    return {
      success: true,
      user: newUser,
    };
  };

  const login = (email, password) => {
    const users = getUsers();

    const foundUser = users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password
    );

    if (!foundUser) {
      return {
        success: false,
        message: "Email atau password salah.",
      };
    }

    localStorage.setItem("loginUser", JSON.stringify(foundUser));
    setUser(foundUser);
    setIsLogin(true);

    return {
      success: true,
      user: foundUser,
    };
  };

  const logout = () => {
    localStorage.removeItem("loginUser");
    setUser(null);
    setIsLogin(false);
  };

  const updateProfile = ({
    nama,
    profileImage,
    currentPassword,
    newPassword,
  }) => {
    if (!user) {
      return {
        success: false,
        message: "Pengguna belum login.",
      };
    }

    const users = getUsers();

    const currentUser = users.find(
      (item) => item.email === user.email
    );

    if (!currentUser) {
      return {
        success: false,
        message: "Data pengguna tidak ditemukan.",
      };
    }

    if (newPassword) {
      if (!currentPassword) {
        return {
          success: false,
          message: "Masukkan password sebelumnya.",
        };
      }

      if (currentPassword !== currentUser.password) {
        return {
          success: false,
          message: "Password sebelumnya tidak cocok.",
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          message: "Password baru minimal 6 karakter.",
        };
      }
    }

    const updatedUser = {
      ...currentUser,
      nama:
        nama !== undefined
          ? nama
          : currentUser.nama,
      profileImage:
        profileImage !== undefined
          ? profileImage
          : currentUser.profileImage || "",
      password:
        newPassword || currentUser.password,
    };

    const updatedUsers = users.map((item) =>
      item.email === currentUser.email
        ? updatedUser
        : item
    );

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(updatedUsers)
    );

    localStorage.setItem(
      "registeredUser",
      JSON.stringify(updatedUser)
    );

    localStorage.setItem(
      "loginUser",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);

    return {
      success: true,
      message: "Profil berhasil diperbarui.",
      user: updatedUser,
    };
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLogin,
        isAdmin,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
