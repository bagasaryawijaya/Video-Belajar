import axios from "axios";

const API_ROOT = String(import.meta.env.VITE_API_URL || "/api")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "") || "";

const api = axios.create({
  baseURL: `${API_ROOT}/api/categories`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function handleError(error, fallback) {
  const message = error.response?.data?.message || error.message || fallback;
  throw new Error(message);
}

export async function getCategories() {
  try {
    return (await api.get("/")).data?.data || [];
  } catch (error) {
    handleError(error, "Gagal mengambil bidang studi.");
  }
}

export async function addCategory(name) {
  try {
    const response = await api.post("/", { name: String(name || "").trim() });
    return response.data?.data;
  } catch (error) {
    handleError(error, "Gagal menambahkan bidang studi.");
  }
}

export async function deleteCategory(id) {
  try {
    await api.delete(`/${id}`);
    return true;
  } catch (error) {
    handleError(error, "Gagal menghapus bidang studi.");
  }
}
