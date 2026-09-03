import axios from "axios";

const API_ROOT = String(import.meta.env.VITE_API_URL || "/api").trim().replace(/\/+$/, "").replace(/\/courses$/, "");
const api = axios.create({ baseURL: `${API_ROOT}/categories`, timeout: 10000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getCategories() {
  const response = await api.get("/");
  return response.data?.data || [];
}
export async function addCategory(name) {
  const response = await api.post("/", { name });
  return response.data?.data;
}
export async function deleteCategory(id) {
  await api.delete(`/${id}`);
}
