"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-600 to-fuchsia-600 text-white">
      <h1 className="text-4xl font-bold mb-3">AI PostCare</h1>
      <p className="mb-6 text-lg">Asistente IA para recuperación post-bariátrica.</p>
      <div className="flex gap-4">
        <Link href="/login" className="px-5 py-2 bg-white text-purple-700 rounded-md font-semibold hover:bg-purple-100 transition">Entrar</Link>
        <Link href="/dashboard/patients" className="px-5 py-2 border border-white rounded-md hover:bg-white/10 transition">Probar Chat</Link>
      </div>
      <footer className="mt-10 text-sm text-white/80">
        © 2025 <b>AI PostCare</b> — Smart Care, Human Touch.
      </footer>
    </main>
  );
}
