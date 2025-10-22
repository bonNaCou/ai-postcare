"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import LanguageSelector from "@/components/LanguageSelector";

<header className="flex justify-between items-center mb-10">
  ...
  <LanguageSelector />
</header>

type Paciente = {
  id: string;
  nombre?: string;
  estado?: string;
  createdAt?: any;
};

export default function DoctorDashboard() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filtered, setFiltered] = useState<Paciente[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 Load patients
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "usuarios"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setPacientes(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error loading patients:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔍 Filter
  useEffect(() => {
    const s = search.trim().toLowerCase();
    setFiltered(
      !s
        ? pacientes
        : pacientes.filter(
            (p) =>
              p.nombre?.toLowerCase().includes(s) ||
              p.id.toLowerCase().includes(s)
          )
    );
  }, [search, pacientes]);

  // 💬 Chat placeholder
  const openChat = (id: string, nombre?: string) => {
    alert(`💬 Opening AI Chat for patient: ${nombre ?? id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Image
            src="/postcare-logo.webp"
            alt="AI PostCare Logo"
            width={130}
            height={120}
            className="rounded-full shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Doctor Dashboard</h1>
            <p className="text-sm text-gray-500">
              Monitor and guide your bariatric patients intelligently.
            </p>
          </div>
        </div>

        <nav className="flex gap-4 text-sm">
          <Link href="/" className="text-gray-700 hover:text-purple-700 transition">
            🏠 Home
          </Link>
          <Link href="/dashboard/patients" className="text-gray-700 hover:text-purple-700 transition">
            👩🏾 Patient Dashboard
          </Link>
        </nav>
      </header>

      {/* Search */}
      <div className="flex justify-between items-center mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by name or ID..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <span className="text-sm text-gray-500 ml-4">{filtered.length} results</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-400">
          <h2 className="text-sm text-gray-500 mb-1">Total Patients</h2>
          <p className="text-3xl font-bold text-purple-700">{pacientes.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-400">
          <h2 className="text-sm text-gray-500 mb-1">Stable Recovery</h2>
          <p className="text-3xl font-bold text-green-600">
            {pacientes.filter((p) => p.estado?.toLowerCase() === "en recuperación").length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-400">
          <h2 className="text-sm text-gray-500 mb-1">New This Week</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {pacientes.filter((p) => {
              if (!p.createdAt?.toDate) return false;
              const diff =
                (Date.now() - p.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24);
              return diff <= 7;
            }).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">📋 Patient Overview</h2>

        {loading ? (
          <p className="text-gray-500 italic">Loading patient data...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 italic">No patients found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm border-t border-gray-100">
              <thead>
                <tr className="border-b bg-purple-50">
                  <th className="py-2 px-3 font-medium text-gray-700">Name</th>
                  <th className="py-2 px-3 font-medium text-gray-700">Status</th>
                  <th className="py-2 px-3 font-medium text-gray-700">Registered</th>
                  <th className="py-2 px-3 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-purple-50/40 transition">
                    <td className="py-2 px-3">{p.nombre ?? "—"}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          p.estado === "en recuperación"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.estado ?? "Unknown"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500">
                      {p.createdAt?.toDate
                        ? p.createdAt.toDate().toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => openChat(p.id, p.nombre)}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        💬 Open Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-sm text-gray-500">
        💜 <strong>AI PostCare</strong> — “Smart Care, Human Touch”
      </footer>
    </div>
  );
}
