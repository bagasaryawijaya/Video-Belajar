import axios from "axios";
import defaultBlogs from "../data/blogs";

const KEY = "videoBelajarBlogs";
const API_URL = "/api/courses";
const api = axios.create({ baseURL: API_URL.replace(/\/courses\/?$/, ""), timeout: 8000 });

export const readBlogs = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch { /* fallback ke data lokal */ }
  localStorage.setItem(KEY, JSON.stringify(defaultBlogs));
  return defaultBlogs;
};

export const saveBlogs = (blogs) => localStorage.setItem(KEY, JSON.stringify(blogs));

export async function getBlogs() {
  try {
    const response = await api.get("/blogs");
    const data = response.data?.data ?? response.data;
    if (Array.isArray(data) && data.length) return data;
  } catch { /* fallback ke data lokal */ }
  return readBlogs();
}

export async function saveBlog(blog) {
  try {
    const response = blog.id
      ? await api.put(`/blogs/${blog.id}`, blog)
      : await api.post("/blogs", blog);
    return response.data?.data ?? response.data;
  } catch {
    const blogs = readBlogs();
    const item = { ...blog, id: blog.id || Date.now() };
    saveBlogs(blog.id ? blogs.map((b) => b.id === blog.id ? item : b) : [item, ...blogs]);
    return item;
  }
}

export async function deleteBlog(id) {
  try { await api.delete(`/blogs/${id}`); return true; } catch {
    saveBlogs(readBlogs().filter((b) => b.id !== id));
    return true;
  }
}
