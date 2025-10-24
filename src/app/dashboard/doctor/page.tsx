"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
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
};

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const convertWeight = (w?: number) =>
    w ? (unit === "imperial" ? (w * 2.20462).toFixed(1) : w.toFixed(1)) : "—";
  const convertHeight = (h?: number) =>
    h ? (unit === "imperial" ? (h * 3.28084).toFixed(2) : h.toFixed(2)) : "—";

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "patients"), orderBy("name"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setPatients(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error loading patients:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/postcare-logo-new.webp"
            alt="AI PostCare Logo"
            width={100}
            height={100}
            className="rounded-full shadow-lg border-2 border-purple-200"
          />
          <div>
            <h1 className="text-3xl font-bold text-purple-700">
              {t("doctorDashboard")}
            </h1>
            <p className="text-sm text-gray-500">{t("welcomeDoctor")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSelector />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as "metric" | "imperial")}
            className="border border-purple-300 rounded-md text-sm p-1"
          >
            <option value="metric">Metric (kg/m)</option>
            <option value="imperial">Imperial (lbs/ft)</option>
          </select>
          <Link
            href="/dashboard/patients"
            className="text-purple-700 hover:underline text-sm"
          >
            {t("patientDashboard")}
          </Link>
        </div>
      </header>

      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search")}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:max-w-md focus:ring-2 focus:ring-purple-400 outline-none"
        />
        <span className="text-sm text-gray-500">
          {filtered.length} {t("results")}
        </span>
      </div>

      {/* Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-400">
          <h2 className="text-sm text-gray-500 mb-1">{t("total Patients")}</h2>
          <p className="text-3xl font-bold text-purple-700">{total}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-400">
          <h2 className="text-sm text-gray-500 mb-1">
            {t("stableRecovery")}
          </h2>
          <p className="text-3xl font-bold text-green-600">{recovering}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-400">
          <h2 className="text-sm text-gray-500 mb-1">{t("newThisWeek")}</h2>
          <p className="text-3xl font-bold text-yellow-600">{newWeek}</p>
        </div>
      </section>

      {/* Patient Table */}
      <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">
          {t("patientOverview")}
        </h2>

        {loading ? (
          <p className="text-gray-500 italic">{t("loading")}</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 italic">{t("noPatients")}</p>
        ) : (
          <table className="min-w-full text-left text-sm border-t border-gray-100">
            <thead>
              <tr className="border-b bg-purple-50">
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("name")}
                </th>
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("weight")}
                </th>
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("height")}
                </th>
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("status")}
                </th>
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("registered")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-purple-50/40">
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
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.status ?? "Unknown"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-500">
                    {p.createdAt?.toDate
                      ? p.createdAt.toDate().toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="mt-10 text-center text-sm text-gray-500">
        <b>AI PostCare</b> — Smart Care, Human Touch.
      </footer>
    </main>
  );
}
