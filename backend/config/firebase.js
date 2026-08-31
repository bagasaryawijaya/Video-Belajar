import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

function serviceAccountFromEnv() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (b64) {
    try {
      const json = Buffer.from(b64, "base64").toString("utf8");
      return JSON.parse(json);
    } catch (error) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_BASE64 tidak valid: ${error.message}`);
    }
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    try {
      return JSON.parse(raw.replace(/\\n/g, "\n"));
    } catch (error) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON tidak valid: ${error.message}`);
    }
  }

  // Fallback hanya untuk development. File service-account.json sengaja tidak disertakan di ZIP produksi.
  throw new Error("Firebase Admin belum dikonfigurasi. Isi FIREBASE_SERVICE_ACCOUNT_BASE64 di Vercel/.env lokal.");
}

if (!admin.apps.length) {
  const serviceAccount = serviceAccountFromEnv();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
}

export const firestore = admin.firestore();
export const bucket = admin.storage().bucket();
export const FieldValue = admin.firestore.FieldValue;
export default admin;
