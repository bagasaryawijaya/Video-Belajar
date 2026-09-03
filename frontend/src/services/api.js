import axios from "axios";

// Di production Vercel gunakan /api pada domain yang sama.
const rawApiUrl = String(import.meta.env.VITE_API_URL || "/api").trim().replace(/\/+$/, "");
const API_ROOT = rawApiUrl.replace(/\/courses$/, "").replace(/\/auth$/, "") || "/api";
const API_URL = `${API_ROOT}/courses`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (response) => response.data?.data ?? response.data;
const handleError = (error) => {
  if (error.response) throw new Error(error.response.data?.message || `Request gagal (${error.response.status})`);
  if (error.request) throw new Error("Backend belum terhubung. Pastikan deployment Vercel dan Firebase sudah dikonfigurasi.");
  throw error;
};

export const getCourses = async () => { try { return unwrap(await api.get("/")) || []; } catch (e) { handleError(e); } };
export const getCourseBySlug = async (slug) => { try { return unwrap(await api.get(`/slug/${encodeURIComponent(slug)}`)); } catch (e) { handleError(e); } };
export const getCourseById = async (id) => { try { return unwrap(await api.get(`/${id}`)); } catch (e) { handleError(e); } };
export const addCourse = async (course) => { try { return unwrap(await api.post("/", course)); } catch (e) { handleError(e); } };
export const updateCourse = async (id, course) => { try { return unwrap(await api.put(`/${id}`, course)); } catch (e) { handleError(e); } };
export const deleteCourse = async (id) => { try { return unwrap(await api.delete(`/${id}`)); } catch (e) { handleError(e); } };
export default api;
