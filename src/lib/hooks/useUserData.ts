"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface PatientProfile {
  name?: string;
  gender?: string;
  dob?: string;
  stage?: string;
  height?: number;
  heightUnit?: string;
  currentWeight?: number;
  prevWeight?: number;
  weightUnit?: string;
  weightGoal?: number;
  painLevel?: number;
  mood?: string;
  hydration?: string;
  nextFollowUp?: string;
  drugAlarm?: boolean;
  mealAlarm?: boolean;
  waterAlarm?: boolean;
  bmiHistory?: number[];
}

export function useUserData() {
  const [profile, setProfile] = useState<PatientProfile>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      setUser(u);
      const ref = doc(db, "patients", u.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data() as PatientProfile);
      else await setDoc(ref, {});
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const saveProfile = async (updates: Partial<PatientProfile>) => {
    if (!user) return;
    const ref = doc(db, "patients", user.uid);
    const newData = { ...profile, ...updates };
    await setDoc(ref, newData, { merge: true });
    setProfile(newData);
  };

  return { profile, setProfile, saveProfile, loading, user };
}
