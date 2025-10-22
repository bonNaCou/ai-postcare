"use client";

import React, { useEffect, useState } from "react";
import { db } from "../lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function FirebaseTest() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "usuarios"));
      setData(snapshot.docs.map(doc => doc.data()));
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Prueba de conexión con Firestore</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.nombre}</li>
        ))}
      </ul>
    </div>
  );
}
