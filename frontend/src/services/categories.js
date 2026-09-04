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

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.message ||
  fallback;

export const getCategories = async () => {
  try {
    return (await api.get("/")).data?.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error, "Gagal mengambil bidang studi."));
  }
};

export const createCategory = async (data) => {
  try {
    return (await api.post("/", data)).data?.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Gagal menambahkan bidang studi."));
  }
};

export const updateCategory = async (id, data) => {
  try {
    return (await api.put(`/${id}`, data)).data?.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Gagal memperbarui bidang studi."));
  }
};

export const deleteCategory = async (id) => {
  try {
    return await api.delete(`/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Gagal menghapus bidang studi."));
  }
};
