import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // proses payment

    res.json({
      success: true,
      message: "Payment berhasil",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
