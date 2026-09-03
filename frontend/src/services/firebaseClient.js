// Firebase Web SDK (compat) is loaded from index.html so the project does not
// need to duplicate the large Firebase SDK inside the frontend bundle.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseAuth = null;

function ensureFirebase() {
  if (!window.firebase) {
    throw new Error("Firebase Web SDK belum dimuat. Periksa index.html.");
  }
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Konfigurasi Firebase Web belum lengkap. Isi semua VITE_FIREBASE_* di Vercel.");
  }
  if (!window.firebase.apps.length) window.firebase.initializeApp(firebaseConfig);
  return window.firebase;
}

export function getFirebaseAuth() {
  if (firebaseAuth) return firebaseAuth;
  const firebase = ensureFirebase();
  firebaseAuth = firebase.auth();
  return firebaseAuth;
}

export async function signInWithGooglePopup() {
  const firebase = ensureFirebase();
  const auth = getFirebaseAuth();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await auth.signInWithPopup(provider);
  const idToken = await result.user.getIdToken(true);
  return { idToken, firebaseUser: result.user };
}

export async function signOutFirebase() {
  if (firebaseAuth) await firebaseAuth.signOut();
}
