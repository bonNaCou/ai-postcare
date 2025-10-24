import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const saveUserToFirestore = async (user: any) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || "Anonymous",
      role: "patient", // default role
      createdAt: new Date(),
    });
    console.log("✅ User saved to Firestore:", user.email);
  }
};