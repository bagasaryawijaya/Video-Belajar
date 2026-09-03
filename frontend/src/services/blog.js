import axios from "axios";

const raw = String(import.meta.env.VITE_API_URL || "/api").trim().replace(/\/+$/, "");
const API_ROOT = raw.replace(/\/courses$/, "").replace(/\/auth$/, "") || "/api";
const api = axios.create({ baseURL: API_ROOT, timeout: 15000, headers: { "Content-Type": "application/json" } });

// Semua request admin otomatis membawa token login.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const readBlogs = () => [];
export const saveBlogs = () => {};

const message = (error, fallback) => error.response?.data?.message || error.message || fallback;

export async function getBlogs() {
  try {
    const response = await api.get("/blogs");
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) { throw new Error(message(error, "Gagal mengambil berita dari Firebase.")); }
}

export async function saveBlog(blog) {
  try {
    const response = blog.id
      ? await api.put(`/blogs/${blog.id}`, blog)
      : await api.post("/blogs", blog);
    return response.data?.data ?? response.data;
  } catch (error) { throw new Error(message(error, "Gagal menyimpan berita ke Firebase.")); }
}

export async function deleteBlog(id) {
  try { await api.delete(`/blogs/${id}`); return true; }
  catch (error) { throw new Error(message(error, "Gagal menghapus berita dari Firebase.")); }
}
