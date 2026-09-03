import { Router } from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/categoryController.js";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", getCategories);
router.post("/", authenticate, requireRole("admin", "superadmin"), createCategory);
router.delete("/:id", authenticate, requireRole("admin", "superadmin"), deleteCategory);
export default router;
