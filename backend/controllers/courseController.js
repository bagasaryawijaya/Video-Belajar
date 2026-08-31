import crypto from "crypto";
import { firestore } from "../config/firebase.js";
import { saveBase64Image } from "./uploadController.js";

const courses = () => firestore.collection("courses");
const lessons = () => firestore.collection("lessons");
const categories = () => firestore.collection("categories");
const users = () => firestore.collection("users");

const publicImage = (value) => {
  const v = String(value || "");
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:") || v.startsWith("/") ? v : `/uploads/${v}`;
};
const levelValue = (value) => {
  const v = String(value || "beginner").toLowerCase();
  return ["beginner", "intermediate", "advanced"].includes(v) ? v : "beginner";
};
const slugify = (value) => String(value || "course").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "course";

async function uniqueSlug(title, currentId = null) {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;
  while (true) {
    const snap = await courses().where("course_slug", "==", slug).limit(1).get();
    if (snap.empty || snap.docs[0].id === currentId) return slug;
    slug = `${base}-${suffix++}`;
  }
}

async function ensureCategory(name) {
  const categoryName = String(name || "Uncategorized").trim() || "Uncategorized";
  const slug = slugify(categoryName);
  const snap = await categories().where("slug", "==", slug).limit(1).get();
  if (!snap.empty) return snap.docs[0].id;
  const id = crypto.randomUUID();
  await categories().doc(id).set({ id, name: categoryName, slug, description: "Kategori VideoBelajar", createdAt: new Date().toISOString() });
  return id;
}

async function ensureInstructor(name, role = "instructor") {
  const instructorName = String(name || "Administrator").trim() || "Administrator";
  const snap = await users().where("nama", "==", instructorName).limit(1).get();
  if (!snap.empty) return { id: snap.docs[0].id, name: instructorName, role: snap.docs[0].data().role || role };
  const id = crypto.randomUUID();
  await users().doc(id).set({ id, nama: instructorName, email: `${slugify(instructorName)}@local.video-belajar.test`, role, emailVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { merge: true });
  return { id, name: instructorName, role };
}

function normalizeCourse(data, id) {
  const pct = Number(data.discount_percent || 0);
  const now = new Date().toISOString().slice(0, 10);
  const start = data.discount_start_date ? String(data.discount_start_date).slice(0, 10) : null;
  const end = data.discount_end_date ? String(data.discount_end_date).slice(0, 10) : null;
  const active = pct > 0 && (!start || now >= start) && (!end || now <= end);
  const price = Number(data.price || 0);
  return {
    id: String(id), title: data.course_title || data.title || "", description: data.description || "", thumbnail: publicImage(data.thumbnail_url || data.thumbnail),
    instructor: data.instructor_name || data.instructor || "", instructorRole: data.instructor_role || data.instructorRole || "",
    rating: Number(data.average_rating ?? data.rating ?? 0), discount_percent: pct, discount_start_date: data.discount_start_date || "", discount_end_date: data.discount_end_date || "",
    reviews: Number(data.review_count || 0), price, category: data.category_name || data.category || "", level: String(data.level || "beginner").charAt(0).toUpperCase() + String(data.level || "beginner").slice(1),
    course_slug: data.course_slug || data.slug || "", slug: data.course_slug || data.slug || "", duration_hours: Number(data.duration_hours || 0), language: "Bahasa Indonesia",
    final_price: active ? Math.max(0, price * (1 - pct / 100)) : price, discount_active: active,
  };
}

async function withLessons(data, id) {
  const snap = await lessons().where("courseId", "==", id).get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => Number(a.order_index || 0) - Number(b.order_index || 0));
  return { ...normalizeCourse(data, id), lessons: items.map((v) => ({ id: v.id, title: v.title, duration_seconds: Number(v.duration_seconds || 0), video_url: v.video_url || "", is_preview: Boolean(v.is_preview) })) };
}

export const getCourses = async (req, res, next) => {
  try {
    const { q = "", search = "", category, level, minPrice, maxPrice, sortBy = "created_at", order = "desc" } = req.query;
    const keyword = String(q || search || "").trim().toLowerCase();
    const snap = await courses().get();
    let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows = rows.filter((c) => {
      const text = `${c.course_title || c.title || ""} ${c.description || ""} ${c.category_name || c.category || ""}`.toLowerCase();
      const price = Number(c.price || 0);
      return (!keyword || text.includes(keyword)) && (!category || String(c.category_slug || c.category || "").toLowerCase() === String(category).toLowerCase() || String(c.category_name || "").toLowerCase() === String(category).toLowerCase()) && (!level || String(c.level || "").toLowerCase() === String(level).toLowerCase()) && (minPrice === undefined || minPrice === "" || price >= Number(minPrice)) && (maxPrice === undefined || maxPrice === "" || price <= Number(maxPrice));
    });
    const fields = { title: "course_title", price: "price", rating: "average_rating", students: "total_students", created_at: "createdAt" };
    const field = fields[sortBy] || "createdAt";
    rows.sort((a, b) => {
      const av = a[field] ?? ""; const bv = b[field] ?? "";
      const result = av > bv ? 1 : av < bv ? -1 : 0;
      return String(order).toLowerCase() === "asc" ? result : -result;
    });
    res.json({ success: true, data: rows.map((r) => normalizeCourse(r, r.id)), meta: { search: keyword, category: category || null, level: level || null, sortBy, order: String(order).toLowerCase() === "asc" ? "asc" : "desc", total: rows.length } });
  } catch (error) { next(error); }
};

export const getCourseBySlug = async (req, res, next) => {
  try {
    const snap = await courses().where("course_slug", "==", req.params.slug).limit(1).get();
    if (snap.empty) return res.status(404).json({ success: false, message: "Course tidak ditemukan" });
    res.json({ success: true, data: await withLessons(snap.docs[0].data(), snap.docs[0].id) });
  } catch (error) { next(error); }
};

export const getCourseById = async (req, res, next) => {
  try {
    const doc = await courses().doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: "Course tidak ditemukan" });
    res.json({ success: true, data: await withLessons(doc.data(), doc.id) });
  } catch (error) { next(error); }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, description = "", thumbnail, thumbnailData, instructor = "", instructorRole = "instructor", rating = 0, price = 0, category, level = "Beginner", duration_hours = 0, discount_percent = 0, discount_start_date = null, discount_end_date = null } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "title wajib diisi" });
    if (!thumbnail && !thumbnailData) return res.status(400).json({ success: false, message: "Gambar thumbnail wajib dipilih" });
    if (!category) return res.status(400).json({ success: false, message: "category wajib diisi" });
    if (Number(discount_percent) < 0 || Number(discount_percent) > 100) return res.status(400).json({ success: false, message: "discount_percent harus 0-100" });
    if (discount_start_date && discount_end_date && String(discount_start_date) > String(discount_end_date)) return res.status(400).json({ success: false, message: "Tanggal mulai diskon tidak boleh setelah tanggal akhir" });
    const id = crypto.randomUUID(); const slug = await uniqueSlug(title); const categoryId = await ensureCategory(category); const inst = await ensureInstructor(instructor, instructorRole);
    const image = thumbnailData ? await saveBase64Image(thumbnailData, req.body.thumbnailName, "courses") : thumbnail;
    const data = { id, course_title: title.trim(), course_slug: slug, thumbnail_url: image, description, category_name: String(category).trim(), category_slug: slugify(category), categoryId, instructor_name: inst.name, instructor_role: inst.role, instructorId: inst.id, level: levelValue(level), duration_hours: Number(duration_hours) || 0, total_students: 0, average_rating: Number(rating) || 0, review_count: 0, price: Number(price) || 0, discount_percent: Number(discount_percent) || 0, discount_start_date, discount_end_date, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await courses().doc(id).set(data);
    res.status(201).json({ success: true, data: normalizeCourse(data, id) });
  } catch (error) { next(error); }
};

export const updateCourse = async (req, res, next) => {
  try {
    const ref = courses().doc(req.params.id); const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, message: "Course tidak ditemukan" });
    const current = existing.data(); const body = req.body;
    const nextDiscount = Number(body.discount_percent ?? current.discount_percent ?? 0); const nextStart = body.discount_start_date ?? current.discount_start_date ?? null; const nextEnd = body.discount_end_date ?? current.discount_end_date ?? null;
    if (nextDiscount < 0 || nextDiscount > 100) return res.status(400).json({ success: false, message: "discount_percent harus 0-100" });
    if (nextStart && nextEnd && String(nextStart) > String(nextEnd)) return res.status(400).json({ success: false, message: "Tanggal mulai diskon tidak boleh setelah tanggal akhir" });
    const patch = { updatedAt: new Date().toISOString() };
    if (body.title !== undefined) { patch.course_title = body.title; if (body.title !== current.course_title) patch.course_slug = await uniqueSlug(body.title, req.params.id); }
    if (body.description !== undefined) patch.description = body.description;
    if (body.category !== undefined) { patch.category_name = body.category; patch.category_slug = slugify(body.category); patch.categoryId = await ensureCategory(body.category); }
    if (body.instructor !== undefined) { const i = await ensureInstructor(body.instructor, body.instructorRole || "instructor"); patch.instructor_name = i.name; patch.instructor_role = i.role; patch.instructorId = i.id; }
    if (body.level !== undefined) patch.level = levelValue(body.level); if (body.duration_hours !== undefined) patch.duration_hours = Number(body.duration_hours) || 0; if (body.rating !== undefined) patch.average_rating = Number(body.rating) || 0; if (body.price !== undefined) patch.price = Number(body.price) || 0; patch.discount_percent = nextDiscount; patch.discount_start_date = nextStart; patch.discount_end_date = nextEnd;
    if (body.thumbnailData) patch.thumbnail_url = await saveBase64Image(body.thumbnailData, body.thumbnailName, "courses"); else if (body.thumbnail !== undefined) patch.thumbnail_url = body.thumbnail;
    await ref.update(patch); const updated = (await ref.get()).data(); res.json({ success: true, data: normalizeCourse(updated, ref.id) });
  } catch (error) { next(error); }
};

export const deleteCourse = async (req, res, next) => {
  try { const ref = courses().doc(req.params.id); const doc = await ref.get(); if (!doc.exists) return res.status(404).json({ success: false, message: "Course tidak ditemukan" }); const ls = await lessons().where("courseId", "==", ref.id).get(); const batch = firestore.batch(); ls.docs.forEach((d) => batch.delete(d.ref)); batch.delete(ref); await batch.commit(); res.json({ success: true, message: "Course berhasil dihapus" }); } catch (error) { next(error); }
};
