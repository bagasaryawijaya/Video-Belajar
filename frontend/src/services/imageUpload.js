import axios from "axios";

const API_ROOT = "/api";

export async function uploadImage(file, folder = "images") {
  if (!file) return null;
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 10 MB.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const token = localStorage.getItem("accessToken");

  const response = await axios.post(`${API_ROOT}/uploads`, formData, {
    timeout: 60000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data?.data;
}
