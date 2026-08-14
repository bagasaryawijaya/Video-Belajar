import axios from "axios";

// MockAPI tidak membutuhkan API key untuk CRUD dasar.
// URL fallback ini membuat aplikasi tetap bekerja di Vercel
// meskipun VITE_API_URL belum dibuat di Vercel.
const DEFAULT_API_URL =
  "https://6a7eaf4b3183f5fd884a50ee.mockapi.io/Courses";

const API_URL = (
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error, fallback) => {
  if (error.response) {
    const data = error.response.data;

    if (typeof data === "string" && data.trim()) {
      return `${fallback} (${error.response.status}): ${data}`;
    }

    if (data?.message) {
      return `${fallback} (${error.response.status}): ${data.message}`;
    }

    return `${fallback} (HTTP ${error.response.status}).`;
  }

  if (error.request) {
    return `${fallback} Tidak ada respons dari MockAPI. Periksa koneksi internet dan URL API.`;
  }

  return error.message || fallback;
};

// Mengubah data MockAPI menjadi format yang digunakan aplikasi.
const mapCourseFromApi = (course) => ({
  id: course.id,
  title: course.title || "",
  description: course.deskripsi ?? course.description ?? "",
  thumbnail:
    course["thumbnail-course"] ??
    course.thumbnail ??
    course.image ??
    "",
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

// Mengubah format aplikasi menjadi field yang digunakan MockAPI.
const mapCourseToApi = (course) => ({
  title: String(course.title ?? "").trim(),
  deskripsi: String(course.description ?? ""),
  "thumbnail-course": String(course.thumbnail ?? ""),
  instruktur: String(course.instructor ?? ""),
  "jabatan-instruktur": String(course.instructorRole ?? ""),
  kategori: String(course.category ?? ""),
  level: String(course.level ?? "Beginner"),
  rating: Number(course.rating) || 0,
  "jumlah-review": Number(course.reviews) || 0,
  harga: Number(course.price) || 0,
});

// GET - mengambil seluruh course.
export const getCourses = async () => {
  try {
    const response = await api.get("");
    const data = Array.isArray(response.data) ? response.data : [];

    return data.map(mapCourseFromApi);
  } catch (error) {
    console.error("GET /Courses gagal:", error);
    throw new Error(getErrorMessage(error, "Gagal mengambil data courses."));
  }
};

// ADD - menambahkan course baru.
export const addCourse = async (course) => {
  try {
    const payload = mapCourseToApi(course);
    const response = await api.post("", payload);

    return mapCourseFromApi(response.data);
  } catch (error) {
    console.error("POST /Courses gagal:", error);
    console.error("Payload:", mapCourseToApi(course));
    throw new Error(getErrorMessage(error, "Gagal menambahkan course."));
  }
};

// UPDATE - menggunakan PATCH agar hanya field course yang dikirim
// dan tidak bergantung pada field bawaan MockAPI lainnya.
export const updateCourse = async (id, courseData) => {
  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("ID course tidak ditemukan.");
  }

  try {
    const response = await api.patch(
      `/${encodeURIComponent(String(id))}`,
      mapCourseToApi(courseData)
    );

    return mapCourseFromApi(response.data);
  } catch (error) {
    console.error(`PATCH /Courses/${id} gagal:`, error);
    throw new Error(getErrorMessage(error, "Gagal mengubah course."));
  }
};

// DELETE - menghapus course berdasarkan ID.
export const deleteCourse = async (id) => {
  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("ID course tidak ditemukan.");
  }

  try {
    await api.delete(`/${encodeURIComponent(String(id))}`);
    return id;
  } catch (error) {
    console.error(`DELETE /Courses/${id} gagal:`, error);
    throw new Error(getErrorMessage(error, "Gagal menghapus course."));
  }
};

export default api;
