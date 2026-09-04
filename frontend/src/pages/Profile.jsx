import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCamera } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import defaultAvatar from "../assets/Avatar1.png";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLogin, updateProfile } = useAuth();
  const [nama, setNama] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLogin) navigate("/login");
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
    if (!file.type.startsWith("image/")) return setError("File harus berupa gambar.");
    if (file.size > 2 * 1024 * 1024) return setError("Ukuran gambar maksimal 2 MB.");
    const reader = new FileReader();
    reader.onloadend = () => { setProfileImage(reader.result); setPreview(reader.result); setError(""); };
    reader.readAsDataURL(file);
  };

  const save = (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    if (!nama.trim()) return setError("Nama tidak boleh kosong.");
    const result = updateProfile({ nama: nama.trim(), profileImage });
    if (!result.success) return setError(result.message);
    setMessage("Profil berhasil diperbarui.");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-4 sm:gap-5">
          <img src={preview || defaultAvatar} alt="Profile" className="h-20 w-20 rounded-md object-cover sm:h-24 sm:w-24" />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-gray-800 sm:text-2xl">{user.nama}</h2>
            <p className="mt-1 truncate text-sm text-gray-700 sm:text-base">{user.email}</p>
            <label htmlFor="profileImage" className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600">
              <FaCamera className="text-xs" /> Ganti Foto Profil
              <input id="profileImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {message && <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={save} className="mt-6">
        <div className="grid gap-4 md:grid-cols-[1.3fr_1.3fr_100px_1fr]">
          <label className="rounded-lg border-2 border-green-500 px-4 py-2">
            <span className="block text-xs font-medium text-green-500">Nama Lengkap</span>
            <input value={nama} onChange={e => setNama(e.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none" />
          </label>
          <label className="rounded-lg border border-gray-200 px-4 py-2">
            <span className="block text-xs font-medium text-gray-500">E-Mail</span>
            <input value={user.email || ""} disabled className="mt-1 w-full bg-transparent text-sm text-gray-700 outline-none" />
          </label>
          <label className="rounded-lg border border-gray-200 px-4 py-2">
            <span className="block text-xs font-medium text-gray-500">Kode</span>
            <input value="+62" disabled className="mt-1 w-full bg-transparent text-sm text-gray-500 outline-none" />
          </label>
          <label className="rounded-lg border border-gray-200 px-4 py-2">
            <span className="block text-xs font-medium text-gray-500">No. Hp</span>
            <input placeholder="Nomor HP" className="mt-1 w-full bg-transparent text-sm outline-none" />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="w-full rounded-lg bg-green-500 px-8 py-3 text-sm font-bold text-white hover:bg-green-600 sm:w-auto">Simpan</button>
        </div>
      </form>
    </div>
  );
}
