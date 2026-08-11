import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaCamera, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLogin, updateProfile } = useAuth();

  const [nama, setNama] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
      return;
    }

    if (user) {
      setNama(user.nama || "");
      setProfileImage(user.profileImage || "");
      setPreview(user.profileImage || "");
    }
  }, [user, isLogin, navigate]);

  if (!user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
      setPreview(reader.result);
      setError("");
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!nama.trim()) {
      setError("Nama tidak boleh kosong.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError("Masukkan password sebelumnya.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Konfirmasi password baru tidak cocok.");
        return;
      }
    }

    const result = updateProfile({
      nama: nama.trim(),
      profileImage,
      currentPassword,
      newPassword,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-gray-600 hover:text-green-600"
        >
          <FaArrowLeft />
          Kembali
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Edit Profile
          </h1>

          <p className="text-gray-500 mt-2">
            Ubah nama, gambar profile, dan password.
          </p>

          <div className="flex flex-col items-center mt-8">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
                  <FaUser size={48} className="text-green-500" />
                </div>
              )}

              <label
                htmlFor="profileImage"
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center cursor-pointer hover:bg-green-700"
              >
                <FaCamera />
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {message && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block font-medium mb-2">Nama</label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Email</label>
              <input
                value={user.email || ""}
                disabled
                className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-500"
              />
            </div>

            <hr />

            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaLock className="text-green-600" />
                Ganti Password
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Password sebelumnya harus cocok untuk mengganti password.
              </p>
            </div>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Password sebelumnya"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password baru"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password baru"
              className="w-full border rounded-lg px-4 py-3"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 border py-3 rounded-lg"
              >
                Batal
              </button>

              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
