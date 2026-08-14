import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import Homepage from "./pages/Homepage";
import Coursespage from "./pages/Coursespage";
import Aboutpage from "./pages/Aboutpage";
import Contactpage from "./pages/Contactpage";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";

import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>

      {/* =====================================================
          MAIN WEBSITE
      ====================================================== */}

      <Route element={<MainLayout />}>

        {/* HOME */}
        <Route
          path="/"
          element={<Homepage />}
        />

        {/* COURSES */}
        <Route
          path="/courses"
          element={<Coursespage />}
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={<Aboutpage />}
        />

        {/* CONTACT */}
        <Route
          path="/contact"
          element={<Contactpage />}
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>

      {/* =====================================================
          AUTHENTICATION
      ====================================================== */}

      <Route element={<AuthLayout />}>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<SignUp />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

      </Route>

      {/* =====================================================
          JIKA URL TIDAK DITEMUKAN
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;