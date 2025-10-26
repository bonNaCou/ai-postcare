import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// ✅ Evita inicializar dos veces
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Inicializa los servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ⚙️ Configura un tiempo de reintento de subida más corto (30 s)
try {
  // En Firebase v10+, accedemos a través de `storage._delegate`
  if ((storage as any)?._delegate?.setMaxUploadRetryTime) {
    (storage as any)._delegate.setMaxUploadRetryTime(30000);
  }
} catch (err) {
  console.warn("⚠️ Unable to set max upload retry time:", err);
}

export { app, auth, db, storage };