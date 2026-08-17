import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = login(formData.email, formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-5 py-10">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-green-600">
          Masuk ke Akun
        </h1>

        <p className="text-center text-gray-500 mt-3 mb-8">
          Yuk, lanjutin belajarmu di videobelajar.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Email */}
          <div>
            <label className="block text-gray-600 mb-2">
              E-Mail <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@gmail.com"
              required
              className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-600 mb-2">
              Kata Sandi <span className="text-red-500">*</span>
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
              >
                {showPassword ? (
                  <FaEye size={18} />
                ) : (
                  <FaEyeSlash size={18} />
                )}
              </button>

            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2">
                {error}
              </p>
            )}

          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-gray-500 hover:text-green-600"
            >
              Lupa Password?
            </Link>
          </div>

          {/* Login */}
          <button
            type="submit"
            className="w-full bg-[#35C84A] hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Masuk
          </button>

          {/* Register */}
          <Link
            to="/signup"
            className="block text-center w-full bg-[#E8F8DF] text-[#35C84A] py-3 rounded-lg font-semibold hover:bg-[#d9f6cc] transition"
          >
            Daftar
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500">
              atau
            </span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full border border-gray-300 rounded-lg py-3 flex justify-center items-center gap-3 hover:bg-gray-50 transition"
          >
            <FaGoogle className="text-xl text-red-500" />

            <span className="font-semibold text-gray-700">
              Masuk dengan Google
            </span>

          </button>

        </form>

      </div>
    </div>
  );
}