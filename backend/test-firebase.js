import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  console.log("✅ Firebase berhasil diinisialisasi!");

  const db = admin.firestore();

  const snapshot = await db.collection("test").limit(1).get();

  console.log("✅ Firestore berhasil terhubung!");
  console.log("Jumlah data:", snapshot.size);

} catch (error) {
  console.error("❌ Firebase gagal terhubung!");
  console.error(error);
}