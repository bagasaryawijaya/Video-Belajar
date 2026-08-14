import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.warn("VITE_API_URL belum dikonfigurasi.");
}

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
    course["thumbnail-course"] ??
    course.thumbnail ??
    course.image ??
    "",
  instructor:
    course.instruktur ??
    course.instructor ??
    "",
  instructorRole:
    course["jabatan-instruktur"] ??
    course.instructorRole ??
    course.role ??
    "",
  category:
    normalizeCategory(course.kategori ?? course.category ?? ""),
  level: course.level ?? "Beginner",
  rating: Number(course.rating) || 0,
  reviews:
    Number(course["jumlah-review"] ?? course.reviews) || 0,
  price:
    Number(course.harga ?? course.price) || 0,
});

// Mengubah format aplikasi menjadi format field MockAPI
const ALLOWED_CATEGORIES = [
  "UI/UX Design",
  "Web Development",
  "Data Analyst",
];

const normalizeCategory = (category) =>
  ALLOWED_CATEGORIES.includes(category) ? category : "";

const mapCourseToApi = (course) => ({
  title: course.title || "",
  deskripsi: course.description || "",
  // Schema MockAPI: thumbnail-course = String.
  // Nilainya dapat berupa URL gambar atau Data URL hasil upload komputer.
  "thumbnail-course": typeof course.thumbnail === "string"
    ? course.thumbnail
    : "",

  instruktur: course.instructor || "",
  "jabatan-instruktur": course.instructorRole || "",
  kategori: normalizeCategory(course.category),
  level: course.level || "Beginner",
  rating: Number(course.rating) || 0,
  "jumlah-review": Number(course.reviews) || 0,
  harga: Number(course.price) || 0,
});

// Helper untuk menangani error API
const getErrorMessage = (error, defaultMessage) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      defaultMessage
    );
  }

  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  return defaultMessage;
};

// GET - mengambil seluruh course
export const getCourses = async () => {
  try {
    const response = await api.get("/");

    return response.data.map(mapCourseFromApi);
  } catch (error) {
    console.error("Gagal mengambil courses:", error);

    throw new Error(
      getErrorMessage(error, "Gagal mengambil data courses."),
      {
        cause: error,
      }
    );
  }
};

// ADD - menambahkan course baru
export const addCourse = async (course) => {
  try {
    const response = await api.post(
      "/",
      mapCourseToApi(course)
    );

    return mapCourseFromApi(response.data);
  } catch (error) {
    console.error("Gagal menambahkan course:", error);

    throw new Error(
      getErrorMessage(error, "Gagal menambahkan course."),
      {
        cause: error,
      }
    );
  }
};

// UPDATE - mengubah course berdasarkan ID
export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(
      `/${id}`,
      mapCourseToApi(courseData)
    );

    return mapCourseFromApi(response.data);
  } catch (error) {
    console.error("Gagal mengubah course:", error);

    throw new Error(
      getErrorMessage(error, "Gagal mengubah course."),
      {
        cause: error,
      }
    );
  }
};

// DELETE - menghapus course berdasarkan ID
export const deleteCourse = async (id) => {
  try {
    await api.delete(`/${id}`);

    return id;
  } catch (error) {
    console.error("Gagal menghapus course:", error);

    throw new Error(
      getErrorMessage(error, "Gagal menghapus course."),
      {
        cause: error,
      }
    );
  }
};

export default api;