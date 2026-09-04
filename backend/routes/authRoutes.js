import { Router } from "express";
import { verifySmtpConnection } from "../services/emailService.js";
import {
  signup,
  googleLogin,
  login,
  verifyEmail,
  verifyCode,
  resendVerificationCode,
  me,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/google", googleLogin);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/verify-code", verifyCode);
router.post("/resend-verification-code", resendVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.get("/me", authenticate, me);

router.get("/smtp-test", async (req, res, next) => {
  try {
    const result = await verifySmtpConnection();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
