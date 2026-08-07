import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Coursespage from "./pages/Coursespage";
import Aboutpage from "./pages/Aboutpage";
import Programpage from "./pages/Programpage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ================= AUTH ================= */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* ================= MAIN ================= */}

      <Route element={<MainLayout />}>

        <Route
          path="/"
          element={<Homepage />}
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Coursespage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <Aboutpage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/program"
          element={
            <ProtectedRoute>
              <Programpage />
            </ProtectedRoute>
          }
        />

      </Route>

      {/* ================= DEFAULT ================= */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;