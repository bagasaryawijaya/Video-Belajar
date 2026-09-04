import crypto from "crypto";
import { bucket } from "../config/firebase.js";

const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export async function uploadBuffer(buffer, originalName, mimeType, folder = "uploads") {
  if (!allowedMime.has(mimeType)) {
    throw new Error("Tipe file tidak didukung.");
  }

  if (!buffer?.length) throw new Error("File kosong.");
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error("Ukuran file maksimal 10 MB.");
  }

  const extension = originalName?.includes(".")
    ? `.${originalName.split(".").pop().replace(/[^a-z0-9]/gi, "").toLowerCase()}`
    : "";

  const fileName = `${String(folder).replace(/[^a-z0-9/_-]/gi, "")}/${crypto.randomBytes(12).toString("hex")}${extension}`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      cacheControl: "public,max-age=31536000",
    },
    resumable: false,
  });

  // Signed URL tidak bergantung pada public bucket dan cocok untuk deployment server.
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });

  return { fileName, url };
}
