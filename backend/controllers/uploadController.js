import { uploadBuffer } from "../services/storageService.js";

export async function saveBase64Image(imageData, originalName = "", folder = "images") {
  if (!imageData || typeof imageData !== "string") return null;

  const match = imageData.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
  if (!match) {
    throw new Error("Format gambar tidak valid. Gunakan JPG, PNG, WEBP, atau GIF.");
  }

  const buffer = Buffer.from(match[2], "base64");
  const result = await uploadBuffer(
    buffer,
    originalName || "image",
    match[1],
    folder
  );

  return result.url;
}

export async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payload file wajib dikirim dengan field 'file'.",
      });
    }

    const result = await uploadBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      req.body.folder || "uploads"
    );

    res.status(201).json({
      success: true,
      message: "File berhasil diupload ke Firebase Storage.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
