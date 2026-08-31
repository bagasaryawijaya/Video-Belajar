import { firestore } from "./firebase.js";

// Firebase Firestore menjadi database utama aplikasi.
// Nama koleksi: users, courses, lessons, blogs, orders, payments, payment_methods, categories.
export async function checkDatabase() {
  await firestore.collection("_health").doc("firestore").set(
    { checkedAt: new Date().toISOString(), provider: "firebase-firestore" },
    { merge: true }
  );
}

export { firestore };
export default firestore;
