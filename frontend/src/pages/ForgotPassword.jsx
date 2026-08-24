import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Nanti bisa diganti API reset password
    console.log("Reset password untuk:", email);

    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF6] px-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Judul */}
        <h1 className="text-3xl font-bold text-center text-green-600">
          Lupa Password
        </h1>

        <p className="text-center text-gray-500 mt-3 mb-8">
          Masukkan email yang terdaftar. Kami akan mengirimkan link untuk
          mengatur ulang password Anda.
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block mb-2 text-gray-600">
                Email
              </label>

              <div className="relative">

                <FaEnvelope
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  required
                  placeholder="email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
                />

              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#35C84A] hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition"
            >
              Kirim Link Reset Password
            </button>

          </form>
        ) : (
          <div className="text-center">

            <div className="bg-green-100 text-green-700 rounded-lg p-4 mb-6">
              Link reset password telah dikirim ke:
              <br />
              <span className="font-semibold">{email}</span>
            </div>

          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-green-600 hover:underline font-semibold"
          >
            ← Kembali ke Login
          </Link>
        </div>

      </div>
    </div>
  );
}