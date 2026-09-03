import axios from "axios";

const KEY = "videoBelajarBlogs";
const API_URL = import.meta.env.VITE_API_URL || "/api/courses";
const api = axios.create({ baseURL: API_URL.replace(/\/courses\/?$/, ""), timeout: 8000 });

export const readBlogs = () => [];

export const saveBlogs = (blogs) => localStorage.setItem(KEY, JSON.stringify(blogs));

export async function getBlogs() {
  try {
    const response = await api.get("/blogs");
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal mengambil berita dari Firebase.");
  }
}

export async function saveBlog(blog) {
  try {
    const response = blog.id
      ? await api.put(`/blogs/${blog.id}`, blog)
      : await api.post("/blogs", blog, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
  }
});
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal menyimpan berita ke Firebase.");
  }
}

export async function deleteBlog(id) {
  try { await api.delete(`/blogs/${id}`); return true; } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal menghapus berita dari Firebase.");
  }
}
