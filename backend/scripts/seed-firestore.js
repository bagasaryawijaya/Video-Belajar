import "dotenv/config";
import admin, { firestore } from "../config/firebase.js";
import crypto from "node:crypto";
import bcrypt from "bcrypt";

async function upsertAdmin(email, password, role, nama) {
  if (!email || !password) return;
  const normalized = email.trim().toLowerCase();
  const users = firestore.collection("users");
  const snap = await users.where("email", "==", normalized).limit(1).get();
  const data = {
    nama, email: normalized, role, emailVerified: true,
    passwordHash: await bcrypt.hash(password, 12),
    updatedAt: new Date().toISOString(),
  };
  if (snap.empty) {
    const id = crypto.randomUUID();
    await users.doc(id).set({ id, phone: "", profileImage: "", ...data, createdAt: new Date().toISOString() });
    console.log(`Created ${role}: ${normalized}`);
  } else {
    await snap.docs[0].ref.set(data, { merge: true });
    console.log(`Updated ${role}: ${normalized}`);
  }
}

await upsertAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, "admin", "Administrator");
await upsertAdmin(process.env.SUPER_ADMIN_EMAIL, process.env.SUPER_ADMIN_PASSWORD, "superadmin", "Super Administrator");
console.log("Firestore seed selesai.");
await admin.app().delete();
