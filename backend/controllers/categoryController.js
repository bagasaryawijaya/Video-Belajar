import crypto from "crypto";
import { firestore } from "../config/firebase.js";

const categories = () => firestore.collection("categories");
const slugify = (value) => String(value || "category").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category";



export async function getCategories(req, res, next) {
  try {
    const snap = await categories().get();
    const existing = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    existing.sort((a, b) => String(a.name).localeCompare(String(b.name), "id"));
    res.json({ success: true, data: existing });
  } catch (error) { next(error); }
}

export async function createCategory(req, res, next) {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ success: false, message: "Nama bidang studi wajib diisi." });
    const slug = slugify(name);
    const duplicate = await categories().where("slug", "==", slug).limit(1).get();
    if (!duplicate.empty) return res.status(409).json({ success: false, message: "Bidang studi sudah ada." });
    const ref = categories().doc(crypto.randomUUID());
    const data = { id: ref.id, name, slug, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await ref.set(data);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
}

export async function deleteCategory(req, res, next) {
  try {
    const ref = categories().doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: "Bidang studi tidak ditemukan." });

    const name = doc.data()?.name;
    const used = await firestore.collection("courses").where("categoryId", "==", ref.id).limit(1).get();
    if (!used.empty) return res.status(409).json({ success: false, message: `Bidang studi "${name}" masih dipakai oleh course dan tidak dapat dihapus.` });

    await ref.delete();
    res.json({ success: true, message: "Bidang studi berhasil dihapus." });
  } catch (error) { next(error); }
}
