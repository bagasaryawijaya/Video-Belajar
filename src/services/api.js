import axios from "axios";

// URL MockAPI dari environment variable
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL belum dikonfigurasi.");
}

// Instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// =========================
// GET - Ambil semua courses
// =========================
export const getCourses = async () => {
  try {
    const response = await api.get("");

    // MockAPI seharusnya mengembalikan array
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Pengaman jika response dibungkus object
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response.data?.courses)) {
      return response.data.courses;
    }

    console.error("Format response GET tidak valid:", response.data);
    return [];
  } catch (error) {
    console.error("GET courses gagal:", error);
    throw error;
  }
};

// =========================
// GET - Ambil course by ID
// =========================
export const getCourseById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`GET course ${id} gagal:`, error);
    throw error;
  }
};

// =========================
// POST - Tambah course
// =========================
export const addCourse = async (course) => {
  try {
    const response = await api.post("", course);

    return response.data;
  } catch (error) {
    console.error("ADD course gagal:", error);
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    throw error;
  }
};

// =========================
// PUT - Edit course
// =========================
export const updateCourse = async (id, course) => {
  try {
    const response = await api.put(`/${id}`, course);

    return response.data;
  } catch (error) {
    console.error(`UPDATE course ${id} gagal:`, error);
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    throw error;
  }
};

// =========================
// DELETE - Hapus course
// =========================
export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/${id}`);

    return response.data;
  } catch (error) {
    console.error(`DELETE course ${id} gagal:`, error);
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    throw error;
  }
};

export default api;