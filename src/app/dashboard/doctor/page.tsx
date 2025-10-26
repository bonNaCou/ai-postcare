"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import Image from "next/image";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

type Patient = {
  id: string;
  name?: string;
  weight?: number;
  height?: number;
  status?: string;
  createdAt?: any;
  uploads?: any[];
};

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [darkMode, setDarkMode] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const backgrounds = [
    "/assets/bg1.webp",
    "/assets/bg2.webp",
    "/assets/bg3.webp",
    "/assets/bg4.webp",
    "/assets/bg5.webp",
  ];

  const convertWeight = (w?: number) =>
    w ? (unit === "imperial" ? (w * 2.20462).toFixed(1) : w.toFixed(1)) : "—";
  const convertHeight = (h?: number) =>
    h ? (unit === "imperial" ? (h * 3.28084).toFixed(2) : h.toFixed(2)) : "—";

  // 🌙 Theme
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

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "patients"), orderBy("name"));
        const snap = await getDocs(q);
        const data = await Promise.all(
          snap.docs.map(async (d) => {
            const patient = { id: d.id, ...(d.data() as any) };
            const folderRef = ref(storage, `patients/${d.id}/uploads`);
            let uploads: any[] = [];
            try {
              const files = await listAll(folderRef);
              uploads = await Promise.all(
                files.items.map(async (f) => ({
                  name: f.name,
                  url: await getDownloadURL(f),
                }))
              );
            } catch {
              uploads = [];
            }
            return { ...patient, uploads };
          })
        );
        setPatients(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error loading patients:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Search
  useEffect(() => {
    const s = search.trim().toLowerCase();
    setFiltered(
      !s
        ? patients
        : patients.filter(
            (p) =>
              p.name?.toLowerCase().includes(s) ||
              p.id.toLowerCase().includes(s)
          )
    );
  }, [search, patients]);

  const total = patients.length;
  const recovering = patients.filter(
    (p) => p.status?.toLowerCase() === "recovering"
  ).length;
  const newWeek = patients.filter((p) => {
    if (!p.createdAt?.toDate) return false;
    const diff =
      (Date.now() - p.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

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

      <div className="relative z-10 p-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Image
              src="/postcare-logo-new.webp"
              alt="AI PostCare Logo"
              width={80}
              height={80}
              className="rounded-full shadow-md border-4 border-purple-200 dark:border-purple-700"
            />
            <div>
              <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 tracking-tight">
                Doctor Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Patient monitoring and progress analytics.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center text-sm">
            <LanguageSelector />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as "metric" | "imperial")}
              className="border border-purple-300 dark:border-purple-600 rounded-md text-sm p-1"
            >
              <option value="metric">Metric (kg/m)</option>
              <option value="imperial">Imperial (lbs/ft)</option>
            </select>
            <button
              onClick={toggleTheme}
              className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full"
            >
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={changeBackground}
              className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full"
            >
              Change background
            </button>
            <Link
              href="/dashboard/home"
              className="text-purple-600 underline hover:text-purple-800"
            >
              Back to Home
            </Link>
          </div>
        </header>

        {/* Search */}
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 w-full md:max-w-md focus:ring-2 focus:ring-purple-400 outline-none dark:bg-gray-900"
          />
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {filtered.length} results
          </span>
        </div>

        {/* Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-purple-500">
            <h2 className="text-sm text-gray-500 mb-1">Total Patients</h2>
            <p className="text-3xl font-semibold text-purple-700 dark:text-purple-300">
              {total}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
            <h2 className="text-sm text-gray-500 mb-1">Stable Recoveries</h2>
            <p className="text-3xl font-semibold text-green-600">{recovering}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-yellow-500">
            <h2 className="text-sm text-gray-500 mb-1">New This Week</h2>
            <p className="text-3xl font-semibold text-yellow-600">{newWeek}</p>
          </div>
        </section>

        {/* Table */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-4">
            Patient Overview
          </h2>

          {loading ? (
            <p className="text-gray-500 italic">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 italic">No patients found.</p>
          ) : (
            <table className="min-w-full text-left text-sm border-t border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="border-b bg-purple-50 dark:bg-gray-900/40">
                  <th className="py-2 px-3 font-semibold">Name</th>
                  <th className="py-2 px-3 font-semibold">Weight</th>
                  <th className="py-2 px-3 font-semibold">Height</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Reports</th>
                  <th className="py-2 px-3 font-semibold">Registered</th>
                  <th className="py-2 px-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-purple-50/40 dark:hover:bg-gray-700/30"
                  >
                    <td className="py-2 px-3">{p.name ?? "—"}</td>
                    <td className="py-2 px-3">
                      {convertWeight(p.weight)} {unit === "imperial" ? "lbs" : "kg"}
                    </td>
                    <td className="py-2 px-3">
                      {convertHeight(p.height)} {unit === "imperial" ? "ft" : "m"}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          p.status === "recovering"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {p.status ?? "Unknown"}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {p.uploads && p.uploads.length > 0 ? (
                        <Link
                          href={p.uploads[0].url}
                          target="_blank"
                          className="text-purple-600 underline text-xs"
                        >
                          {p.uploads.length} file(s)
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs">No uploads</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-500">
                      {p.createdAt?.toDate
                        ? p.createdAt.toDate().toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Link
                        href={`/dashboard/patient/${p.id}`}
                        className="text-purple-600 hover:underline text-xs font-medium"
                      >
                        View Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
          ©️ {new Date().getFullYear()} AI PostCare. All rights reserved.
        </footer>
      </div>
    </main>
  );
}