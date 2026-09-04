import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AccountLayout from "./layouts/AccountLayout";

import Homepage from "./pages/Homepage";
import Coursepage from "./pages/Coursepage";
import CourseDetailPage from "./pages/CourseDetailPage";
import Aboutpage from "./pages/Aboutpage";
import Blogpage from "./pages/Blogpage";
import BlogDetailPage from "./pages/BlogDetailPage";
import LearningPage from "./pages/LearningPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import MyCourses from "./pages/MyCourses";
import Orders from "./pages/Orders";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import PaymentPage from "./pages/PaymentPage";
import { PaymentSuccessPage, PaymentFailedPage } from "./pages/PaymentResult";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/courses" element={<Coursepage />} />
        <Route path="/course" element={<Navigate to="/courses" replace />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/about" element={<Aboutpage />} />
        <Route path="/blog" element={<Blogpage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />

        <Route element={<AccountLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Route>

      <Route path="/learn/:id" element={<LearningPage />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      <Route path="/checkout/:id/method" element={<PaymentMethodPage />} />
      <Route path="/checkout/:id/pay" element={<PaymentPage />} />
      <Route path="/checkout/:id/success" element={<PaymentSuccessPage />} />
      <Route path="/checkout/:id/failed" element={<PaymentFailedPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email-code" element={<VerifyEmail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
