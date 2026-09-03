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

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  // Izinkan preview deployment Vercel untuk project ini.
  try {
    const hostname = new URL(origin).hostname;
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origin ${origin} tidak diizinkan oleh CORS`)
      );
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "8mb" }));

app.get("/api/health", async (req, res, next) => {
  try {
    await checkDatabase();

    res.json({
      success: true,
      message: "API dan Firebase Firestore/Storage terhubung.",
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/categories", categoryRoutes);

app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  })
);

app.use((err, req, res, next) => {
  console.error("API Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;

if (process.env.VERCEL !== "1") {
  const { ensureDefaultAdminAccounts } =
    await import("./controllers/authController.js");

  await ensureDefaultAdminAccounts().catch((error) => {
    console.error("Admin seed:", error.message);
  });

  const port = Number(process.env.PORT || 5000);

  app.listen(port, () => {
    console.log(`Backend berjalan di http://localhost:${port}`);
  });
}