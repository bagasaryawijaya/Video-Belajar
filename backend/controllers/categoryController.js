import crypto from "crypto";
import { firestore } from "../config/firebase.js";

/*
|--------------------------------------------------------------------------
| FIRESTORE COLLECTION
|--------------------------------------------------------------------------
*/

const categoriesCollection = () =>
  firestore.collection("categories");

/*
|--------------------------------------------------------------------------
| SLUGIFY
|--------------------------------------------------------------------------
*/

function slugify(value) {
  return (
    String(value || "category")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "category"
  );
}

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

export async function getCategories(req, res, next) {
  try {
    const snapshot = await categoriesCollection().get();

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    categories.sort((a, b) =>
      String(a.name || "").localeCompare(
        String(b.name || ""),
        "id"
      )
    );

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/

export async function createCategory(req, res, next) {
  try {
    const name = String(req.body?.name || "").trim();

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama bidang studi wajib diisi.",
      });
    }

    const slug = slugify(name);

    /*
    |--------------------------------------------------------------------------
    | Check duplicate
    |--------------------------------------------------------------------------
    */

    const duplicateSnapshot =
      await categoriesCollection()
        .where("slug", "==", slug)
        .limit(1)
        .get();

    if (!duplicateSnapshot.empty) {
      return res.status(409).json({
        success: false,
        message: "Bidang studi sudah ada.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Firestore Document ID
    |--------------------------------------------------------------------------
    */

    const categoryId = crypto.randomUUID();

    const categoryRef =
      categoriesCollection().doc(categoryId);

    const now = new Date().toISOString();

    const categoryData = {
      id: categoryId,
      name,
      slug,
      createdAt: now,
      updatedAt: now,
    };

    /*
    |--------------------------------------------------------------------------
    | Save to Firestore
    |--------------------------------------------------------------------------
    */

    await categoryRef.set(categoryData);

    return res.status(201).json({
      success: true,
      message: "Bidang studi berhasil ditambahkan.",
      data: categoryData,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/

export async function deleteCategory(req, res, next) {
  try {
    const categoryId = String(req.params.id || "").trim();

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "ID bidang studi tidak valid.",
      });
    }

    const categoryRef =
      categoriesCollection().doc(categoryId);

    const categoryDocument =
      await categoryRef.get();

    /*
    |--------------------------------------------------------------------------
    | Check category
    |--------------------------------------------------------------------------
    */

    if (!categoryDocument.exists) {
      return res.status(404).json({
        success: false,
        message: "Bidang studi tidak ditemukan.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Check if category is used by courses
    |--------------------------------------------------------------------------
    */

    const usedByCourse =
      await firestore
        .collection("courses")
        .where("categoryId", "==", categoryId)
        .limit(1)
        .get();

    if (!usedByCourse.empty) {
      return res.status(409).json({
        success: false,
        message:
          "Bidang studi masih digunakan oleh course dan tidak dapat dihapus.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Delete from Firestore
    |--------------------------------------------------------------------------
    */

    await categoryRef.delete();

    return res.status(200).json({
      success: true,
      message: "Bidang studi berhasil dihapus.",
    });
  } catch (error) {
    next(error);
  }
}