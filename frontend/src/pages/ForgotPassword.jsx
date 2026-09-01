import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import axios from "axios";

const API_ROOT = "/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  async function requestCode(e) {
    e.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const response = await axios.post(`${API_ROOT}/auth/forgot-password`, { email });
      setMessage(response.data?.message || "Kode verifikasi telah dikirim ke email.");
      setStep("code");
      setSecondsLeft(300);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim kode verifikasi.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    clearFeedback();
    if (!/^\d{6}$/.test(code)) {
      setError("Masukkan kode verifikasi 6 digit.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_ROOT}/auth/verify-reset-code`, {
        email,
        code,
      });
      setResetToken(response.data?.data?.resetToken || "");
      setMessage(response.data?.message || "Kode benar. Silakan buat password baru.");
      setStep("password");
    } catch (err) {
      setError(err.response?.data?.message || "Kode verifikasi salah.");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    clearFeedback();
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password harus sama.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_ROOT}/auth/reset-password`, {
        resetToken,
        password,
        confirmPassword,
      });
      setMessage(response.data?.message || "Password berhasil diubah.");
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengubah password.");
    } finally {
      setLoading(false);
    }
  }

  const title = {
    email: "Lupa Password",
    code: "Verifikasi Kode",
    password: "Buat Password Baru",
    done: "Password Berhasil Diubah",
  }[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF6] px-5 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-green-600">{title}</h1>
        <p className="text-center text-gray-500 mt-3 mb-8">
          {step === "email" && "Masukkan email yang terdaftar. Kami akan mengirimkan kode verifikasi."}
          {step === "code" && <>Kode 6 digit telah dikirim ke <span className="font-semibold text-gray-700">{email}</span>.</>}
          {step === "password" && "Kode benar. Sekarang buat password baru untuk akun Anda."}
          {step === "done" && "Password Anda sudah diperbarui. Silakan login dengan password baru."}
        </p>

        {message && <div className="mb-5 rounded-lg bg-green-50 text-green-700 p-4 text-sm">{message}</div>}
        {error && <div className="mb-5 rounded-lg bg-red-50 text-red-600 p-4 text-sm">{error}</div>}

        {step === "email" && (
          <form onSubmit={requestCode} className="space-y-5">
            <div>
              <label className="block mb-2 text-gray-600">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@gmail.com" className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>
            <button disabled={loading} className="w-full bg-[#35C84A] hover:bg-green-600 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition">
              {loading ? "Mengirim..." : "Kirim Kode Verifikasi"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verifyCode} className="space-y-5">
            <div>
              <label className="block mb-2 text-gray-600">Kode Verifikasi</label>
              <div className="relative">
                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input autoFocus inputMode="numeric" maxLength={6} required value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); clearFeedback(); }} placeholder="123456" className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-center tracking-[0.5em] text-lg font-semibold outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">Masukkan kode sebelum waktu habis.</p>
                <span className={`font-bold text-sm ${secondsLeft <= 60 ? "text-red-500" : "text-green-600"}`}>
                  {secondsLeft > 0 ? formatTime(secondsLeft) : "00:00"}
                </span>
              </div>
            </div>
            <button disabled={loading} className="w-full bg-[#35C84A] hover:bg-green-600 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition">
              {loading ? "Memeriksa..." : "Verifikasi Kode"}
            </button>
            <button type="button" disabled={loading || secondsLeft > 0} onClick={() => { setStep("email"); clearFeedback(); }} className="w-full border border-gray-300 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50">
              {secondsLeft > 0 ? `Kirim Kode Lagi (${formatTime(secondsLeft)})` : "Kirim Kode Lagi"}
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={changePassword} className="space-y-5">
            <div>
              <label className="block mb-2 text-gray-600">Password Baru</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => { setPassword(e.target.value); clearFeedback(); }} placeholder="Minimal 6 karakter" className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-gray-600">Konfirmasi Password Baru</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} required minLength={6} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearFeedback(); }} placeholder="Ulangi password baru" className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-400" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <button disabled={loading} className="w-full bg-[#35C84A] hover:bg-green-600 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition">
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </form>
        )}

        {step === "done" && (
          <button onClick={() => navigate("/login")} className="w-full bg-[#35C84A] hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition">
            Ke Login
          </button>
        )}

        {step !== "done" && (
          <div className="mt-8 text-center">
            <Link to="/login" className="text-green-600 hover:underline font-semibold">← Kembali ke Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
