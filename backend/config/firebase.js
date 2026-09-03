import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

function serviceAccountFromEnv() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (b64) {
    try { return JSON.parse(Buffer.from(b64, "base64").toString("utf8")); }
    catch (error) { throw new Error(`FIREBASE_SERVICE_ACCOUNT_BASE64 tidak valid: ${error.message}`); }
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    try { return JSON.parse(raw.replace(/\\n/g, "\n")); }
    catch (error) { throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON tidak valid: ${error.message}`); }
  }

  throw new Error("Firebase Admin belum dikonfigurasi. Isi FIREBASE_SERVICE_ACCOUNT_BASE64 atau FIREBASE_SERVICE_ACCOUNT_JSON.");
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccountFromEnv()) });
}

// Project ini menggunakan Firestore sebagai penyimpanan data utama.
// Firebase Storage tidak diinisialisasi agar error bucket tidak memblokir simpan course/blog/kategori.
export const firestore = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export default admin;
