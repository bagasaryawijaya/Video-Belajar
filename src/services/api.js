import axios from "axios";

// Vercel tidak otomatis menggunakan file .env lokal.
// Karena API ini memang public, gunakan fallback agar production tetap
// bisa terhubung ke MockAPI walaupun VITE_API_URL belum dibuat di Vercel.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://6a7eaf4b3183f5fd884a50ee.mockapi.io/Courses"
).replace(/\\/+$/, "");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Mengubah data dari MockAPI menjadi format yang digunakan aplikasi
const mapCourseFromApi = (course) => ({
  id: course.id,
  title: course.title || "",
  description: course.deskripsi ?? course.description ?? "",
  thumbnail:
    course["thumbnail-course"] ?? course.thumbnail ?? course.image ?? "",
  instructor: course.instruktur ?? course.instructor ?? "",
  instructorRole:
    course["jabatan-instruktur"] ??
    course.instructorRole ??
    course.role ??
    "",
  category: course.kategori ?? course.category ?? "",
  level: course.level ?? "Beginner",
  rating: Number(course.rating) || 0,
  reviews: Number(course["jumlah-review"] ?? course.reviews) || 0,
  price: Number(course.harga ?? course.price) || 0,
});

// Mengubah format aplikasi menjadi format field MockAPI
const mapCourseToApi = (course) => ({
  title: course.title,
  deskripsi: course.description || "",
  "thumbnail-course": course.thumbnail || "",
  instruktur: course.instructor || "",
  "jabatan-instruktur": course.instructorRole || "",
  kategori: course.category || "",
  level: course.level || "Beginner",
  rating: Number(course.rating) || 0,
  "jumlah-review": Number(course.reviews) || 0,
  harga: Number(course.price) || 0,
});

// Membuat pesan error yang lebih jelas untuk production
const getApiError = (error, fallback) => {
  if (error.response) {
    const serverMessage =
      error.response.data?.message ||
      error.response.data?.error ||
      error.response.statusText;

    return `${fallback}${serverMessage ? ` (${serverMessage})` : ""}`;
  }

  if (error.request) {
    return `${fallback} Tidak ada respons dari server API.`;
  }

  return error.message || fallback;
};

// GET
export const getCourses = async () => {
  try {
    const response = await api.get("/");
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(mapCourseFromApi);
  } catch (error) {
    console.error("Gagal mengambil courses:", error);
    throw new Error(getApiError(error, "Gagal mengambil data courses."));
  }
};

// ADD
export const addCourse = async (course) => {
  try {
    const response = await api.post("/", mapCourseToApi(course));
    return mapCourseFromApi(response.data);
  } catch (error) {
    console.error("Gagal menambahkan course:", error);
    throw new Error(getApiError(error, "Gagal menambahkan course."));
  }
};

// UPDATE
// MockAPI mendukung PATCH untuk mengubah resource berdasarkan ID.
// PATCH lebih aman daripada mengirim ulang seluruh resource dengan PUT.
export const updateCourse = async (id, courseData) => {
  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("ID course tidak valid.");
  }

  try {
    const response = await api.patch(
      `/${encodeURIComponent(String(id))}`,
      mapCourseToApi(courseData)
    );

    return mapCourseFromApi(response.data);
  } catch (error) {
    console.error(`Gagal mengubah course dengan ID ${id}:`, error);
    throw new Error(getApiError(error, "Gagal mengubah course."));
  }
};

// DELETE
export const deleteCourse = async (id) => {
  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("ID course tidak valid.");
  }

  try {
    await api.delete(`/${encodeURIComponent(String(id))}`);
    return id;
  } catch (error) {
    console.error(`Gagal menghapus course dengan ID ${id}:`, error);
    throw new Error(getApiError(error, "Gagal menghapus course."));
  }
};

export default api;
