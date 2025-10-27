"use client";

/*
==============================================================
 💜 AI POSTCARE — LOGIN PAGE (Stable Final)
==============================================================
✅ Fully functional login page
✅ Multilingual (i18n)
✅ Email / Google / Facebook login
✅ Smooth background transitions
❌ No Firestore or role logic
🚀 Redirects straight to /dashboard/patients
==============================================================
*/

import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

// 🎨 Backgrounds
const backgrounds = [
  "/assets/bg1.webp",
  "/assets/bg2.webp",
  "/assets/bg3.webp",
  "/assets/bg4.webp",
  "/assets/bg5.webp",
  "/assets/bg6.webp",
  "/assets/bg7.webp",
];

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // State management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState<number>(0);

  // 🎨 Restore saved background
  useEffect(() => {
    const savedIndex = localStorage.getItem("bgIndex");
    if (savedIndex) setBgIndex(Number(savedIndex));
  }, []);

  // 🔁 Check redirect (Google / Facebook)
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log("✅ Logged in via redirect:", result.user.email);
          router.push("/dashboard/patients");
        }
      } catch (err: any) {
        console.error("⚠️ Redirect error:", err);
        setError(err.message);
      }
    };
    checkRedirect();
  }, [router]);

  // 📧 Email login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard/patients");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Google Login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    await signInWithRedirect(auth, provider);
  };

  // 🔷 Facebook Login
  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    provider.addScope("public_profile");
    provider.addScope("email");
    await signInWithRedirect(auth, provider);
  };

  // 🌈 Change Background
  const changeBackground = () => {
    const next = (bgIndex + 1) % backgrounds.length;
    setBgIndex(next);
    localStorage.setItem("bgIndex", next.toString());
  };

  // 💎 UI
  return (
    <main
      className="relative flex items-center justify-center min-h-screen transition-all duration-700"
      style={{
        backgroundImage: `url(${backgrounds[bgIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative z-10 bg-white/95 dark:bg-black/70 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-purple-400/40 transition-all duration-700">
        {/* 🌍 Language Selector */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        {/* Logo */}
        <Image
          src="/postcare-logo-new.webp"
          alt="AI PostCare Logo"
          width={130}
          height={130}
          className="mx-auto mb-6 rounded-full border-4 border-purple-400/70 shadow-lg"
          priority
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-purple-600 mb-1 drop-shadow-md">
          AI PostCare
        </h1>
        <p className="text-gray-700 text-sm mb-8 font-medium tracking-wide">
          {t("welcome") ?? "Welcome to AI PostCare"}
        </p>

        {/* Email + Password Form */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 text-left">
          <input
            type="email"
            placeholder={t("email") ?? "Email"}
            className="border border-purple-200/70 bg-white text-gray-900 p-2 rounded focus:ring-2 focus:ring-purple-300 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t("password") ?? "Password"}
            className="border border-purple-200/70 bg-white text-gray-900 p-2 rounded focus:ring-2 focus:ring-purple-300 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white font-medium transition ${
              loading
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:opacity-90"
            }`}
          >
            {loading ? t("logging_in") ?? "Logging in..." : t("login") ?? "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300/60"></div>
          <span className="text-gray-500 text-sm mx-2">{t("or") ?? "or"}</span>
          <div className="flex-grow h-px bg-gray-300/60"></div>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full border border-gray-300/70 bg-white py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition mb-3"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
            width={20}
            height={20}
          />
          <span className="text-gray-800 font-medium">
            {t("sign_in_google") ?? "Sign in with Google"}
          </span>
        </button>

        {/* Facebook */}
        <button
          onClick={handleFacebookLogin}
          type="button"
          className="w-full border border-gray-300/70 bg-white py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition mb-3"
        >
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
            alt="Facebook logo"
            width={20}
            height={20}
          />
          <span className="text-gray-800 font-medium">
            {t("sign_in_facebook") ?? "Sign in with Facebook"}
          </span>
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {/* Register Link */}
        <p className="mt-5 text-gray-700 text-sm">
          {t("no_account") ?? "Don’t have an account?"}{" "}
          <Link href="/register" className="text-purple-600 hover:underline">
            {t("register") ?? "Register"}
          </Link>
        </p>

        {/* Footer */}
        <footer className="mt-8 text-sm text-gray-700">
          <b className="text-purple-600">AI PostCare</b>
          <br />
          {t("footer_message") ??
            "Recover accompanied, every day, in your language."}
        </footer>

        {/* Background Switch */}
        <button
          onClick={changeBackground}
          className="mt-6 text-xs text-purple-500 hover:text-purple-700 transition underline underline-offset-4"
        >
          {t("change_background") ?? "Change Background Theme"}
        </button>
      </div>
    </main>
  );
}