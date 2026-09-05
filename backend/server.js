import "dotenv/config";

import express from "express";
import cors from "cors";

import { checkDatabase } from "./config/database.js";
import "./config/firebase.js";

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  /*
  |--------------------------------------------------------------------------
  | Server-to-server / Postman / curl
  |--------------------------------------------------------------------------
  */

  if (!origin) {
    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | Environment Origins
  |--------------------------------------------------------------------------
  */

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | Vercel Deployments
  |--------------------------------------------------------------------------
  */

  try {
    const hostname = new URL(origin).hostname;

    if (
      hostname === "localhost" ||
      hostname.endsWith(".vercel.app")
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

app.use(cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `Origin ${origin} tidak diizinkan oleh CORS`
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| IMPORTANT: OPTIONS
|--------------------------------------------------------------------------
|
| Membantu request POST/DELETE dari browser.
|
*/

app.options("*", cors());

/*
|--------------------------------------------------------------------------
| BODY PARSER
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "8mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "8mb",
  })
);

/*
|--------------------------------------------------------------------------
| API ROOT
|--------------------------------------------------------------------------
*/

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API Video Belajar aktif.",

    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      courses: "/api/courses",
      blogs: "/api/blogs",
      categories: "/api/categories",
      uploads: "/api/uploads",
      payments: "/api/payments",
    },
  });
});

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/api/health", async (req, res, next) => {
  try {
    await checkDatabase();

    return res.status(200).json({
      success: true,
      message:
        "API dan Firebase Firestore berhasil terhubung.",
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/blogs", blogRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/uploads", uploadRoutes);

app.use("/api/payments", paymentRoutes);

/*
|--------------------------------------------------------------------------
| 404 API
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan.",
    method: req.method,
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("API Error:", error);

  const statusCode =
    error.status ||
    error.statusCode ||
    500;

  return res.status(statusCode).json({
    success: false,
    message:
      error.message ||
      "Terjadi kesalahan pada server.",
  });
});

export default app;

/*
|--------------------------------------------------------------------------
| LOCAL DEVELOPMENT SERVER
|--------------------------------------------------------------------------
*/

if (process.env.VERCEL !== "1") {
  const port = Number(process.env.PORT || 5000);

  app.listen(port, () => {
    console.log(
      `Backend berjalan di http://localhost:${port}`
    );
  });
}