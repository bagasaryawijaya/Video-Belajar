import { Router } from "express";
import { preparePayment, getPaymentStatus, handleNotification } from "../controllers/paymentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
const router = Router();
router.post("/prepare", authenticate, preparePayment);
router.get("/:paymentId/status", authenticate, getPaymentStatus);
router.post("/notification", handleNotification);
export default router;
