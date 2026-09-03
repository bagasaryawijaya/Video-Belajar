import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/categories`,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(c => {
  const t = localStorage.getItem("accessToken");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export const getCategories = async () =>
  (await api.get("/")).data?.data || [];

export const createCategory = async data =>
  (await api.post("/", data)).data?.data;

export const updateCategory = async (id, data) =>
  (await api.put(`/${id}`, data)).data?.data;

export const deleteCategory = async id =>
  api.delete(`/${id}`);