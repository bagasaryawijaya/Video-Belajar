import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js";
import "./config/firebase.js";
import courseRoutes from "./routes/courseRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "https://video-belajar-three.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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
    await db.query("SELECT 1");

    res.json({
      success: true,
      message: "API dan MySQL terhubung. Firebase Admin aktif.",
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