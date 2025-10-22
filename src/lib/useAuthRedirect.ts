"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "./firebaseConfig";

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ Auth detected:", user.email);

        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            console.log("🆕 Creating user profile in Firestore...");
            await setDoc(userRef, {
              email: user.email,
              name: user.displayName || "Unnamed User",
              role: "patient", // por defecto
              createdAt: new Date(),
            });
          }

          const data = (await getDoc(userRef)).data();
          if (data?.role === "doctor") {
            router.push("/dashboard/doctor");
          } else {
            router.push("/dashboard/patients");
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          router.push("/dashboard/patients");
        }
      } else {
        console.log("🔒 No user logged in, staying on login/register.");
      }
    });

    return () => unsubscribe();
  }, [router]);
}
