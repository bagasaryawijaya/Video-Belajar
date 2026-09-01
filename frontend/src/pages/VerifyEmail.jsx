import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_ROOT = "/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(
    token ? "Memverifikasi email..." : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  async function verifyToken() {
    try {
      const response = await axios.get(
        `${API_ROOT}/auth/verify-email/${encodeURIComponent(token)}`
      );
      setMessage(response.data?.message || "email verified successfully");
      setError("");
      window.setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Verifikasi gagal.");
      setMessage("");
    }
  }

  useEffect(() => {
    if (token) verifyToken();
  }, [token]);

  async function verifyCode() {
    setLoading(true);
    try {
      const response = await axios.post(`${API_ROOT}/auth/verify-code`, {
        email,
        code,
      });
      setMessage(response.data?.message || "email verified successfully");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Kode verifikasi salah.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!email) {
      setError("Masukkan email terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axios.post(`${API_ROOT}/auth/resend-verification-code`, { email });
      setMessage(response.data?.message || "Kode baru telah dikirim.");
      setSecondsLeft(300);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim ulang kode.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-7">
        <h1 className="text-2xl font-bold text-center text-green-600">
          Verifikasi Email
        </h1>

        {message && (
          <div className="mt-5 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {!token && (
          <div className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border rounded-lg px-4 py-3"
            />
            <input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Kode 6 digit"
              className="w-full border rounded-lg px-4 py-3 tracking-[0.4em]"
            />
            <button
              onClick={verifyCode}
              disabled={loading}
              className="w-full bg-green-500 disabled:opacity-60 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Memeriksa..." : "Verifikasi"}
            </button>
            <button
              type="button"
              onClick={resendCode}
              disabled={loading || secondsLeft > 0}
              className="w-full border border-gray-300 py-3 rounded-lg font-semibold text-gray-600 disabled:opacity-60"
            >
              {secondsLeft > 0 ? `Kirim Ulang Kode (${formatTime(secondsLeft)})` : "Kirim Ulang Kode"}
            </button>
          </div>
        )}

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-5 border py-3 rounded-lg font-semibold"
        >
          Ke Login
        </button>
      </div>
    </div>
  );
}
