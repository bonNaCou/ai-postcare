"use client";

import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const backgrounds = [
  "/assets/bg1.webp",
  "/assets/bg2.webp",
  "/assets/bg3.webp",
  "/assets/bg4.webp",
  "/assets/bg5.webp",
  "/assets/bg6.webp",
  "/assets/bg7.webp",
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState<number>(0);
  const router = useRouter();

  // 🌈 Recuperar fondo guardado
  useEffect(() => {
    const savedIndex = localStorage.getItem("bgIndex");
    if (savedIndex) setBgIndex(Number(savedIndex));
  }, []);

  // ✅ Detectar redirección después de login social
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log("✅ Registered via redirect:", result.user.email);
          router.push("/dashboard/patients");
        }
      } catch (err: any) {
        console.error("⚠️ Redirect error:", err);
        setError(err.message);
      }
    };
    checkRedirect();
  }, [router]);

  // 🔹 Crear cuenta con email/contraseña
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard/patients");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    await signInWithRedirect(auth, provider);
  };

  // 🔹 Facebook login
  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    provider.addScope("public_profile");
    provider.addScope("email");
    await signInWithRedirect(auth, provider);
  };

  // 🌈 Cambiar fondo
  const changeBackground = () => {
    const next = (bgIndex + 1) % backgrounds.length;
    setBgIndex(next);
    localStorage.setItem("bgIndex", next.toString());
  };

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

      {/* Contenedor principal */}
      <div className="relative z-10 bg-white/95 dark:bg-black/70 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-purple-400/40">
        {/* 🌟 Logo */}
        <Image
          src="/postcare-logo-new.webp"
          alt="AI PostCare Logo"
          width={130}
          height={130}
          className="mx-auto mb-6 rounded-full border-4 border-purple-400/70 shadow-lg"
          priority
        />

        {/* Título */}
        <h1 className="text-3xl font-bold text-purple-600 mb-1 drop-shadow-md">
          Create Account
        </h1>
        <p className="text-gray-700 text-sm mb-8 font-medium tracking-wide">
          💜 Smart Care, Human Touch — Join AI PostCare today.
        </p>

        {/* Formulario */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4 text-left">
          <input
            type="email"
            placeholder="Email"
            className="border border-purple-200/70 bg-white text-gray-900 p-2 rounded focus:ring-2 focus:ring-purple-300 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-purple-200/70 bg-white text-gray-900 p-2 rounded focus:ring-2 focus:ring-purple-300 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300/60"></div>
          <span className="text-gray-500 text-sm mx-2">or</span>
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
          <span className="text-gray-800 font-medium">Sign up with Google</span>
        </button>

        {/* Facebook */}
        <button
          onClick={handleFacebookLogin}
          type="button"
          className="w-full border border-gray-300/70 bg-white py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
            alt="Facebook logo"
            width={20}
            height={20}
          />
          <span className="text-gray-800 font-medium">Sign up with Facebook</span>
        </button>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {/* Login link */}
        <p className="mt-5 text-gray-700 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </p>

        {/* Footer */}
        <footer className="mt-8 text-sm text-gray-700">
          <b className="text-purple-600">AI PostCare</b>
          <br />
          “Recover accompanied, every day, in your language.”
        </footer>

        <button
          onClick={changeBackground}
          className="mt-6 text-xs text-purple-500 hover:text-purple-700 transition underline underline-offset-4"
        >
          Change Background Theme
        </button>
      </div>
    </main>
  );
}
