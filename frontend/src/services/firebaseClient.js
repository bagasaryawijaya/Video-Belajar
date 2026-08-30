const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseAuth = null;

export function getFirebaseAuth() {
  if (firebaseAuth) return firebaseAuth;
  if (!window.firebase) throw new Error("Firebase SDK belum dimuat.");
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Konfigurasi Firebase Web belum lengkap. Isi VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID.");
  }
  if (!window.firebase.apps.length) window.firebase.initializeApp(firebaseConfig);
  firebaseAuth = window.firebase.auth();
  return firebaseAuth;
}

export async function signInWithGooglePopup() {
  const auth = getFirebaseAuth();
  const provider = new window.firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await auth.signInWithPopup(provider);
  const idToken = await result.user.getIdToken(true);
  return { idToken, firebaseUser: result.user };
}
