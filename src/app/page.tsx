"use client";

// ============================================================
// 💜 AI POSTCARE — Home Page
// ============================================================
// ✅ Detects if a user is logged in
// ✅ Redirects to Doctor or Patient dashboard
// ✅ Logout option
// ✅ Multilingual + responsive
// ============================================================

import Link from "next/link";
import { useAuth } from "./context/AuthContext"; // 🔐 custom auth hook
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

export default function Home() {
  const { user, role, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-600 to-fuchsia-600 text-white text-center px-4 relative">
      {/* 🌍 Language Selector */}
      <div className="absolute top-6 right-6">
        <LanguageSelector />
      </div>

      {/* 💜 Title */}
      <h1 className="text-5xl font-extrabold mb-3 drop-shadow-lg">AI PostCare</h1>
      <p className="mb-6 text-lg opacity-90">
        {t("welcome") ||
          "Smart Care, Human Touch — Your AI companion for post-bariatric recovery."}
      </p>

      {/* 🔗 Dynamic Buttons */}
      {!user ? (
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/login"
            className="px-5 py-2 bg-white text-purple-700 rounded-md font-semibold hover:bg-purple-100 transition"
          >
            {t("login") || "Login"}
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 border border-white rounded-md font-semibold hover:bg-white/10 transition"
          >
            {t("register") || "Register"}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Link
            href={
              role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient"
            }
            className="px-5 py-2 bg-white text-purple-700 rounded-md font-semibold hover:bg-purple-100 transition"
          >
            {role === "doctor"
              ? "Go to Doctor Dashboard"
              : "Go to Patient Dashboard"}
          </Link>

          <button
            onClick={logout}
            className="px-5 py-2 border border-white rounded-md hover:bg-white/10 transition"
          >
            {t("logout") || "Logout"}
          </button>
        </div>
      )}

      {/* 🩺 Footer */}
      <footer className="mt-10 text-sm text-white/80">
        ©️ 2025 <b>AI PostCare</b> — Smart Care, Human Touch 💜
      </footer>
    </main>
  );
}