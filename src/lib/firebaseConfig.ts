// src/lib/firebaseConfig.ts
// ================================================================
// 💜 AI POSTCARE — Firebase Initialization (v10+ compatible)
// ================================================================
// ✅ Handles single initialization (avoids re-instantiation on hot reload)
// ✅ Enables persistent Google / Facebook / Email sessions
// ✅ Optimized upload retry handling
// ✅ Works seamlessly with Next.js and client components
// ================================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ---------------------------------------------------------------
// 🔐 Firebase configuration — pulled from your .env.local file
// Make sure all NEXT_PUBLIC_* variables exist in .env.local
// ---------------------------------------------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// ---------------------------------------------------------------
// ⚙️ Initialize Firebase only once (important for Next.js hot reloads)
// ---------------------------------------------------------------
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ---------------------------------------------------------------
// 🔑 Firebase core services used in AI PostCare
// ---------------------------------------------------------------
const auth = getAuth(app); // User authentication (email, Google, Facebook)
const db = getFirestore(app); // Firestore database (patients, doctors, reports)
const storage = getStorage(app); // Cloud Storage (for file uploads)

// ---------------------------------------------------------------
// 🧠 Enable persistent sessions
// Keeps users signed in even after page refresh or browser restart
// ---------------------------------------------------------------
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("⚠️ Could not enable persistent session:", err);
});

// ---------------------------------------------------------------
// ⚡ Optional: shorten retry time for uploads to 30 seconds
// Prevents long waits during unstable network uploads
// ---------------------------------------------------------------
try {
  if ((storage as any)?._delegate?.setMaxUploadRetryTime) {
    (storage as any)._delegate.setMaxUploadRetryTime(30000);
  }
} catch (err) {
  console.warn("⚠️ Unable to adjust upload retry time:", err);
}

// ---------------------------------------------------------------
// 🚀 Export initialized Firebase services
// These can now be imported anywhere in your app:
// import { auth, db, storage } from "@/lib/firebaseConfig";
// ---------------------------------------------------------------
export { app, auth, db, storage };