import axios from "axios";

/*
|--------------------------------------------------------------------------
| API ROOT
|--------------------------------------------------------------------------
*/

const rawApiUrl = String(
  import.meta.env.VITE_API_URL || "/api"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/courses$/, "");

/*
|--------------------------------------------------------------------------
| COURSE API URL
|--------------------------------------------------------------------------
*/

const API_URL = `${rawApiUrl}/courses`;

/*
|--------------------------------------------------------------------------
| AXIOS
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },

  timeout: 15000,
});

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
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
| RESPONSE HELPER
|--------------------------------------------------------------------------
*/

const unwrap = (response) =>
  response.data?.data ?? response.data;

/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/

function handleError(error) {
  if (error.response) {
    throw new Error(
      error.response.data?.message ||
        `Request gagal (${error.response.status})`
    );
  }

  if (error.request) {
    throw new Error(
      "Backend belum terhubung. Pastikan API Vercel sudah berjalan."
    );
  }

  throw error;
}

/*
|--------------------------------------------------------------------------
| GET COURSES
|--------------------------------------------------------------------------
*/

export async function getCourses() {
  try {
    const response = await api.get("/", {
      params: { _ts: Date.now() },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    const data = unwrap(response);

    if (Array.isArray(data)) {
      return data;
    }

    // Mendukung response API baik dalam bentuk { data: [...] }
    // maupun array langsung.
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    handleError(error);
  }
}

/*
|--------------------------------------------------------------------------
| GET COURSE BY SLUG
|--------------------------------------------------------------------------
*/

export async function getCourseBySlug(slug) {
  try {
    const response = await api.get(
      `/slug/${encodeURIComponent(slug)}`
    );

    return unwrap(response);
  } catch (error) {
    handleError(error);
  }
}

/*
|--------------------------------------------------------------------------
| GET COURSE BY ID
|--------------------------------------------------------------------------
*/

export async function getCourseById(id) {
  try {
    const response = await api.get(
      `/${encodeURIComponent(id)}`
    );

    return unwrap(response);
  } catch (error) {
    handleError(error);
  }
}

/*
|--------------------------------------------------------------------------
| ADD COURSE
|--------------------------------------------------------------------------
*/

export async function addCourse(course) {
  try {
    const response = await api.post(
      "/",
      course
    );

    return unwrap(response);
  } catch (error) {
    handleError(error);
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE COURSE
|--------------------------------------------------------------------------
*/

export async function updateCourse(id, course) {
  try {
    const response = await api.put(
      `/${encodeURIComponent(id)}`,
      course
    );

    return unwrap(response);
  } catch (error) {
    handleError(error);
  }
}

/*
|--------------------------------------------------------------------------
| DELETE COURSE
|--------------------------------------------------------------------------
*/

export async function deleteCourse(id) {
  try {
    const response = await api.delete(
      `/${encodeURIComponent(id)}`
    );

    return unwrap(response);
  } catch (error) {
    handleError(error);
  }
}

export default api;