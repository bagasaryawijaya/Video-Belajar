import axios from "axios";

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
|
| Development:
| Jika VITE_API_URL diisi, gunakan URL tersebut.
|
| Production Vercel:
| Gunakan /api agar request menuju Serverless Function.
|
*/

const API_ROOT = String(
  import.meta.env.VITE_API_URL || "/api"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/categories$/, "");

const api = axios.create({
  baseURL: `${API_ROOT}/categories`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Authorization
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

function handleError(error) {
  if (error.response) {
    const message =
      error.response.data?.message ||
      `Request gagal (${error.response.status})`;

    throw new Error(message);
  }

  if (error.request) {
    throw new Error(
      "Backend tidak dapat dihubungi. Pastikan API Vercel sudah berjalan."
    );
  }

  throw error;
}

/*
|--------------------------------------------------------------------------
| GET Categories
|--------------------------------------------------------------------------
*/

export async function getCategories() {
  try {
    const response = await api.get("/");

    return response.data?.data || [];
  } catch (error) {
    handleError(error);
  }
}

/*
|--------------------------------------------------------------------------
| CREATE Category
|--------------------------------------------------------------------------
*/

export async function addCategory(name) {
  try {
    const response = await api.post("/", {
      name: String(name || "").trim(),
    });

    return response.data?.data;
  } catch (error) {
    handleError(error);
  }
}

/*
|--------------------------------------------------------------------------
| DELETE Category
|--------------------------------------------------------------------------
*/

export async function deleteCategory(id) {
  try {
    const response = await api.delete(
      `/${encodeURIComponent(id)}`
    );

    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export default api;