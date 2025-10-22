"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-white text-gray-500">
        <p>Loading AI PostCare...</p>
      </div>
    );
  }

  if (!user) return null; // Si no hay sesión, evita render

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white text-center px-4">
      {/* Logo */}
      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
        <Image
          src="/postcare-logo.webp"
          alt="AI PostCare Logo"
          width={180}
          height={180}
          style={{ height: "auto" }}
          className="mx-auto"
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-purple-700 mb-2">
        AI PostCare
      </h1>

      {/* Subtitle */}
      <p className="text-gray-500 mb-8 max-w-md">
        💜 Recover accompanied, every day, in your language.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/dashboard/patients"
          className="px-6 py-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition font-medium shadow-md"
        >
          🧍‍♀️ Patient Dashboard
        </Link>
        <Link
          href="/dashboard/doctor"
          className="px-6 py-3 rounded-lg text-purple-700 border border-purple-600 hover:bg-purple-50 transition font-medium shadow-md"
        >
          🧑‍⚕️ Doctor Dashboard
        </Link>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => auth.signOut().then(() => router.push("/login"))}
        className="mt-6 text-sm text-red-500 hover:underline"
      >
        Logout
      </button>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 mt-10">
        💜 <b>AI PostCare</b> — “Smart Care, Human Touch”
      </footer>
    </main>
  );
}
