"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export function useDoctorPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "patients"), orderBy("name"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPatients(data);
      } catch (e) {
        console.error("Error loading patients:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { patients, loading };
}