// Semua gambar kecil disimpan langsung sebagai Data URL di Firestore.
// Tidak menggunakan Firebase Storage, sehingga error "The specified bucket does not exist" tidak terjadi.
// Catatan: Firestore memiliki batas ukuran dokumen 1 MiB, jadi gambar dibatasi agar aman.
const MAX_IMAGE_BYTES = 700 * 1024;
const allowedMime = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function saveBase64Image(imageData) {
  if (!imageData || typeof imageData !== "string") return null;
  const match = imageData.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) throw new Error("Format gambar tidak valid. Gunakan JPG, PNG, WEBP, atau GIF.");

  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length) throw new Error("Gambar kosong.");
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Ukuran gambar terlalu besar untuk disimpan di Firestore. Gunakan gambar maksimal sekitar 700 KB.");
  }
  return `data:${match[1]};base64,${buffer.toString("base64")}`;
}

export async function uploadFile(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Payload file wajib dikirim dengan field 'file'." });
    if (!allowedMime.has(req.file.mimetype)) return res.status(400).json({ success: false, message: "Tipe file harus JPG, PNG, WEBP, atau GIF." });
    if (req.file.size > MAX_IMAGE_BYTES) return res.status(400).json({ success: false, message: "Ukuran gambar terlalu besar untuk Firestore. Maksimal sekitar 700 KB." });

    const url = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    res.status(201).json({ success: true, message: "File siap disimpan bersama data di Firestore.", data: { url, storage: "firestore-data-url" } });
  } catch (error) { next(error); }
}
