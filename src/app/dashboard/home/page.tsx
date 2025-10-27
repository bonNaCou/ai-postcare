"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function HomeDashboard() {
  const { t } = useTranslation();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [greeting, setGreeting] = useState("");

  const backgrounds = [
    "/assets/bg1.webp",
    "/assets/bg2.webp",
    "/assets/bg3.webp",
    "/assets/bg4.webp",
    "/assets/bg5.webp",
    "/assets/bg6.webp",
    "/assets/bg7.webp",
  ];

  // Greeting logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Theme and background
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    const savedBg = localStorage.getItem("bgIndex");
    if (savedBg) setBgIndex(Number(savedBg));
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  const changeBackground = () => {
    const next = (bgIndex + 1) % backgrounds.length;
    setBgIndex(next);
    localStorage.setItem("bgIndex", next.toString());
  };

  // Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) setUser(u);
      else router.replace("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <main
      className={`relative min-h-screen transition-all duration-700 ${
        darkMode
          ? "dark bg-gray-900 text-gray-100"
          : "bg-gradient-to-br from-purple-50 via-white to-purple-100"
      }`}
      style={{
        backgroundImage: `url(${backgrounds[bgIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10 p-10 flex flex-col items-center text-center">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center w-full mb-10">
          <div className="flex items-center gap-4">
            <Image
              src="/postcare-logo-new.webp"
              alt="AI PostCare Logo"
              width={90}
              height={90}
              className="rounded-full shadow-md border-4 border-purple-200 dark:border-purple-700"
            />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                AI PostCare
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {greeting},{" "}
                <span className="text-purple-600 font-medium">
                  {user?.displayName || user?.email || "User"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm">
            <button
              onClick={toggleTheme}
              className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full transition"
            >
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={changeBackground}
              className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full transition"
            >
              Change background
            </button>
            <LanguageSelector />
          </div>
        </header>

        {/* Main Section */}
        <section className="max-w-3xl bg-white/90 dark:bg-gray-800/90 p-10 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-700 backdrop-blur-md">
          <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-300 mb-3">
            Welcome to your AI PostCare dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            Manage your recovery or monitor patients’ progress in one unified
            platform. Choose your workspace below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <Link
              href="/dashboard/patients"
              className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-4 rounded-xl font-medium shadow transition-all"
            >
              Patient Dashboard
            </Link>


            <Link
              href="/dashboard/doctor"
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 rounded-xl font-medium shadow transition-all"
            >
              Doctor Dashboard
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 italic">
            AI-driven insights. Evidence-based recovery.
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-xs text-gray-500 dark:text-gray-400">
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline font-medium mr-4"
          >
            Sign out
          </button>
          ©️ {new Date().getFullYear()} AI PostCare. All rights reserved.
        </footer>
      </div>
    </main>
  );
}