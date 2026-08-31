import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    phone: "",
    country: "+62",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Kata sandi dan konfirmasi kata sandi harus sama.");
      return;
    }

    setLoading(true);
    const result = await register({
      nama: formData.nama,
      email: formData.email,
      phone: `${formData.country || "+62"}${formData.phone}`,
      password: formData.password,
    });

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    alert("Pendaftaran berhasil. Kode verifikasi telah dikirim ke email.");
    setLoading(false);
    navigate("/verify-email-code", {
      state: { email: formData.email },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">

        <h1 className="text-3xl font-bold text-center text-green-600">
          Pendaftaran Akun
        </h1>

        <p className="text-center text-gray-500 mt-2 text-sm">
          Yuk, daftarkan akunmu sekarang juga!
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
        >

          <div>
            <label className="block mb-2 text-gray-700">
              Nama Lengkap
              <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              required
              className="w-full border rounded-md px-4 py-3 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>


          <div>
            <label className="block mb-2 text-gray-700">
              E-Mail
              <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full border rounded-md px-4 py-3 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>


          <div>
            <label className="block mb-2 text-gray-700">
              No. HP
              <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-3">

              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-28 border rounded-md px-2 py-3"
              >
                <option value="+62">
                  🇮🇩 +62
                </option>
                <option value="+65">
                  🇸🇬 +65
                </option>
                <option value="+60">
                  🇲🇾 +60
                </option>
              </select>


              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="81234567890"
                required
                className="flex-1 border rounded-md px-4 py-3 focus:ring-2 focus:ring-green-400 outline-none"
              />

            </div>
          </div>


          <div>
            <label className="block mb-2 text-gray-700">
              Kata Sandi
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
                className="w-full border rounded-md px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>
          </div>


          <div>
            <label className="block mb-2 text-gray-700">
              Konfirmasi Kata Sandi
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                required
                className="w-full border rounded-md px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2">
                {error}
              </p>
            )}

          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>


          <Link
            to="/login"
            className="block text-center w-full bg-green-100 text-green-600 py-3 rounded-lg font-semibold"
          >
            Masuk
          </Link>


          <div className="flex items-center gap-3">
            <div className="flex-1 border-t"></div>
            <span className="text-gray-500 text-sm">
              atau
            </span>
            <div className="flex-1 border-t"></div>
          </div>


          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setError("");
              setLoading(true);
              const result = await loginWithGoogle();
              setLoading(false);
              if (!result.success) {
                setError(result.message);
                return;
              }
              navigate("/");
            }}
            className="w-full border py-3 rounded-lg flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <FaGoogle className="text-red-500" />
            {loading ? "Menghubungkan..." : "Daftar dengan Google"}
          </button>

        </form>

      </div>
    </div>
  );
}