"use client";

// ============================================================
// 💜 AI POSTCARE — Register Page (Role-based + Multilingual)
// ============================================================
// ✅ Supports Email, Google, Facebook registration
// ✅ Creates Firestore user with default role "patient"
// ✅ Redirects automatically to correct dashboard
// ✅ Translated with i18n (English, Spanish, French, Galician)
// ============================================================

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

// 🖼️ Background images (rotating)
const backgrounds = [
  "/assets/bg1.webp",
  "/assets/bg2.webp",
  "/assets/bg3.webp",
  "/assets/bg4.webp",
  "/assets/bg5.webp",
  "/assets/bg6.webp",
];

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // ------------------------------------------------------------
  // 🧩 State management
  // ------------------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState<number>(0);

  // ------------------------------------------------------------
  // 🎨 Load saved background from localStorage
  // ------------------------------------------------------------
  useEffect(() => {
    const savedIndex = localStorage.getItem("bgIndex");
    if (savedIndex) setBgIndex(Number(savedIndex));
  }, []);

  // ------------------------------------------------------------
  // 🔁 Handle redirect result for Google/Facebook signup
  // ------------------------------------------------------------
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await createOrRedirectUser(result.user.uid, result.user.email);
        }
      } catch (err: any) {
        console.error("⚠️ Redirect error:", err);
        setError(err.message);
      }
    };
    checkRedirect();
  }, []);

  // ------------------------------------------------------------
  // 🧾 Handle email registration
  // ------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createOrRedirectUser(result.user.uid, result.user.email);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // 🌍 Google Registration
  // ------------------------------------------------------------
  const handleGoogleRegister = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    await signInWithRedirect(auth, provider);
  };

  // ------------------------------------------------------------
  // 📘 Facebook Registration
  // ------------------------------------------------------------
  const handleFacebookRegister = async () => {
    const provider = new FacebookAuthProvider();
    provider.addScope("public_profile");
    provider.addScope("email");
    await signInWithRedirect(auth, provider);
  };

  // ------------------------------------------------------------
  // 🧠 Firestore user creation + redirect by role
  // ------------------------------------------------------------
  const createOrRedirectUser = async (uid: string, email: string | null) => {
    if (!uid) return;

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    let role = "patient"; // default role

    // 👤 Create new user document if not found
    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        email,
        role: "patient",
        createdAt: new Date(),
      });
    } else {
      const data = snap.data();
      role = data.role || "patient";
    }

    // 🚦 Redirect based on role
    if (role === "doctor") router.push("/dashboard/doctor");
    else router.push("/dashboard/patient");
  };

  // ------------------------------------------------------------
  // 🌄 Change background handler
  // ------------------------------------------------------------
  const changeBackground = () => {
    const next = (bgIndex + 1) % backgrounds.length;
    setBgIndex(next);
    localStorage.setItem("bgIndex", next.toString());
  };

  // ------------------------------------------------------------
  // 🖼️ UI Rendering
  // ------------------------------------------------------------
  return (
    <main
      className="relative flex items-center justify-center min-h-screen transition-all duration-700"
      style={{
        backgroundImage: `url(${backgrounds[bgIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white/95 dark:bg-black/70 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-purple-400/40">
        <Image
          src="/postcare-logo-new.webp"
          alt="AI PostCare Logo"
          width={130}
          height={130}
          className="mx-auto mb-6 rounded-full border-4 border-purple-400/70 shadow-lg"
          priority
        />

        <h1 className="text-3xl font-bold text-purple-600 mb-1 drop-shadow-md">
          AI PostCare
        </h1>
        <p className="text-gray-700 text-sm mb-8 font-medium tracking-wide">
          {t("register") ?? "Register"}
        </p>

        {/* 🌍 Language Selector */}
        <div className="mb-4 flex justify-center">
          <LanguageSelector />
        </div>

        {/* ✉️ Registration Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4 text-left">
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
          <input
            type="password"
            placeholder={t("confirm_password") ?? "Confirm Password"}
            className="border border-purple-200/70 bg-white text-gray-900 p-2 rounded focus:ring-2 focus:ring-purple-300 outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? t("registering") ?? "Registering..." : t("register") ?? "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300/60"></div>
          <span className="text-gray-500 text-sm mx-2">{t("or") ?? "or"}</span>
          <div className="flex-grow h-px bg-gray-300/60"></div>
        </div>

        {/* 🌍 Google Signup */}
        <button
          onClick={handleGoogleRegister}
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
            {t("sign_in_google") ?? "Sign up with Google"}
          </span>
        </button>

        {/* 📘 Facebook Signup */}
        <button
          onClick={handleFacebookRegister}
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
            {t("sign_in_facebook") ?? "Sign up with Facebook"}
          </span>
        </button>

        {/* ⚠️ Error Message */}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {/* 🔑 Already have account */}
        <p className="mt-5 text-gray-700 text-sm">
          {t("already_account") ?? "Already have an account?"}{" "}
          <Link href="/login" className="text-purple-600 hover:underline">
            {t("login") ?? "Login"}
          </Link>
        </p>

        {/* 🩺 Footer */}
        <footer className="mt-8 text-sm text-gray-700">
          <b className="text-purple-600">AI PostCare</b>
          <br />
          {t("footer_message") ??
            "Recover accompanied, every day, in your language."}
        </footer>

        {/* 🎨 Background switch */}
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