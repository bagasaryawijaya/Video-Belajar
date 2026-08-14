import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Coursespage from "./pages/Coursespage";
import Aboutpage from "./pages/Aboutpage";
import Contactpage from "./pages/Contactpage";

import Footer from "./components/Footer";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <Routes>
        {/* ================= AUTH ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* ================= MAIN ================= */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Homepage />} />

          {/* Courses, About, dan Contact dapat diakses tanpa login */}
          <Route path="/courses" element={<Coursespage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<Aboutpage />} />
          <Route path="/contact" element={<Contactpage />} />
        </Route>

        {/* ================= DEFAULT ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
