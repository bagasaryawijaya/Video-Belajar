import { Router } from "express";

import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import {
  authenticate,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
|
| GET /api/categories
|
*/

router.get("/", getCategories);

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
|
| POST /api/categories
|
*/

router.post(
  "/",
  authenticate,
  requireRole("admin", "superadmin"),
  createCategory
);

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
|
| DELETE /api/categories/:id
|
*/

router.delete(
  "/:id",
  authenticate,
  requireRole("admin", "superadmin"),
  deleteCategory
);

export default router;