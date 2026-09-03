import "dotenv/config";
import express from "express";
import cors from "cors";

import { checkDatabase } from "./config/database.js";
import "./config/firebase.js";

import courseRoutes from "./routes/courseRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();

/* =========================================================
   CORS CONFIGURATION
========================================================= */

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  // Request dari server-to-server / Postman / curl
  if (!origin) {
    return true;
  }

  // Origin yang terdaftar di environment variable
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Izinkan Vercel preview deployment
  try {
    const hostname = new URL(origin).hostname;

    if (hostname.endsWith(".vercel.app")) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(`Origin ${origin} tidak diizinkan oleh CORS`)
        );
      }
    },
    credentials: true,
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

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

/* =========================================================
   ROOT API
========================================================= */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API Video Belajar aktif",
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

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", async (req, res, next) => {
  try {
    await checkDatabase();

    res.status(200).json({
      success: true,
      message: "API dan Firebase Firestore/Storage terhubung.",
    });
  } catch (error) {
    next(error);
  }
});

/* =========================================================
   API ROUTES
========================================================= */

/*
  Semua endpoint POST / GET / PUT / DELETE
  didefinisikan di masing-masing file router.

  Contoh:

  app.use("/api/courses", courseRoutes);

  Jika courseRoutes.js memiliki:

  router.post("/", createCourse);

  Maka endpoint-nya menjadi:

  POST /api/courses
*/

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/categories", categoryRoutes);

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    method: req.method,
    path: req.originalUrl,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("API Error:", err);

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* =========================================================
   EXPORT APP
========================================================= */

export default app;

/* =========================================================
   LOCAL SERVER
========================================================= */

if (process.env.VERCEL !== "1") {
  try {
    const { ensureDefaultAdminAccounts } =
      await import("./controllers/authController.js");

    await ensureDefaultAdminAccounts().catch((error) => {
      console.error("Admin seed:", error.message);
    });
  } catch (error) {
    console.error(
      "Gagal menjalankan admin seed:",
      error.message
    );
  }

  const port = Number(process.env.PORT || 5000);

  app.listen(port, () => {
    console.log(
      `Backend berjalan di http://localhost:${port}`
    );
  });
}