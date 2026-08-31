import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseServiceAccount(value, sourceName) {
  try {
    // Vercel kadang menyimpan newline private_key sebagai \n literal.
    const normalized = String(value).trim().replace(/\\n/g, "\n");
    return JSON.parse(normalized);
  } catch (error) {
    throw new Error(`Firebase service account dari ${sourceName} tidak valid JSON: ${error.message}`);
  }
}

function getServiceAccount() {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (base64) {
    // Untuk deployment (mis. Vercel), variabel ini berisi JSON yang di-base64.
    // Untuk local development, project lama menggunakan nilai "service-account.json".
    if (base64.endsWith(".json") && !base64.includes("{")) {
      const filePath = path.isAbsolute(base64) ? base64 : path.resolve(__dirname, "..", base64);
      if (fs.existsSync(filePath)) {
        return parseServiceAccount(fs.readFileSync(filePath, "utf8"), filePath);
      }
    }

    try {
      const decoded = Buffer.from(base64, "base64").toString("utf8");
      if (decoded.trim().startsWith("{")) {
        return parseServiceAccount(decoded, "FIREBASE_SERVICE_ACCOUNT_BASE64");
      }
    } catch {
      // Lanjutkan ke FIREBASE_SERVICE_ACCOUNT_JSON.
    }
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    if (json.endsWith(".json") && !json.includes("{")) {
      const filePath = path.isAbsolute(json) ? json : path.resolve(__dirname, "..", json);
      if (fs.existsSync(filePath)) {
        return parseServiceAccount(fs.readFileSync(filePath, "utf8"), filePath);
      }
    }
    return parseServiceAccount(json, "FIREBASE_SERVICE_ACCOUNT_JSON");
  }

  // Fallback local development: gunakan file service-account.json bila tersedia.
  const localFile = path.resolve(__dirname, "..", "service-account.json");
  if (fs.existsSync(localFile)) {
    return parseServiceAccount(fs.readFileSync(localFile, "utf8"), localFile);
  }

  throw new Error(
    "Firebase Admin belum dikonfigurasi. Isi FIREBASE_SERVICE_ACCOUNT_BASE64/FIREBASE_SERVICE_ACCOUNT_JSON atau sediakan backend/service-account.json."
  );
}

if (!admin.apps.length) {
  const serviceAccount = getServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const firestore = admin.firestore();
export const bucket = admin.storage().bucket();
export const FieldValue = admin.firestore.FieldValue;
export default admin;
