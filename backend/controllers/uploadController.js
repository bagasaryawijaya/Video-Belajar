import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

export const saveBase64Image = async (imageData, originalName = '', folder = 'images') => {
  if (!imageData || typeof imageData !== 'string') return null;
  const match = imageData.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
  if (!match) throw new Error('Format gambar tidak valid. Gunakan JPG, PNG, WEBP, atau GIF.');
  const mime = match[1];
  const extension = ALLOWED.get(mime);
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length) throw new Error('File gambar kosong.');
  if (buffer.length > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB.');

  const safeFolder = String(folder).replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'images';
  const dir = path.join(UPLOAD_ROOT, safeFolder);
  await fs.mkdir(dir, { recursive: true });
  const shortName = `${crypto.randomBytes(6).toString('hex')}${extension}`;
  await fs.writeFile(path.join(dir, shortName), buffer);
  return `${safeFolder}/${shortName}`;
};

export const uploadImage = async (req, res, next) => {
  try {
    const { imageData, originalName, folder = 'images' } = req.body;
    const filename = await saveBase64Image(imageData, originalName, folder);
    res.status(201).json({ success: true, data: { filename, url: `/uploads/${filename}` } });
  } catch (e) { next(e); }
};
