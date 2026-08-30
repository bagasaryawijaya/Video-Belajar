import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/courses";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const unwrap = (response) => response.data?.data ?? response.data;

const handleError = (error) => {
  if (error.response) {
    throw new Error(error.response.data?.message || `Request gagal (${error.response.status})`);
  }
  if (error.request) {
    throw new Error("Backend belum terhubung. Jalankan server backend pada port 5000 atau isi VITE_API_URL.");
  }
  throw error;
};

export const getCourses = async () => {
  try {
    const data = unwrap(await api.get(""));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    handleError(error);
  }
};

export const getCourseBySlug = async (slug) => {
  try { return unwrap(await api.get(`/slug/${encodeURIComponent(slug)}`)); }
  catch (error) { handleError(error); }
};

export const getCourseById = async (id) => {
  try {
    return unwrap(await api.get(`/${id}`));
  } catch (error) {
    handleError(error);
  }
};

export const addCourse = async (course) => {
  try {
    return unwrap(await api.post("", course));
  } catch (error) {
    handleError(error);
  }
};

export const updateCourse = async (id, course) => {
  try {
    return unwrap(await api.put(`/${id}`, course));
  } catch (error) {
    handleError(error);
  }
};

export const deleteCourse = async (id) => {
  try {
    return unwrap(await api.delete(`/${id}`));
  } catch (error) {
    handleError(error);
  }
};

export default api;
