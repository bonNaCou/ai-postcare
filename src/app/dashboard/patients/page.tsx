"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import FileUploader from "./components/FileUploader";
import ChatIA from "../../ChatIA";
import LanguageSelector from "@/components/LanguageSelector";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

// -------------------------------

export default function PatientDashboard() {
  const { t } = useTranslation();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const [profile, setProfile] = useState<any>({
    fullName: "",
    gender: "",
    birthDate: "",
    stage: "",
    weightGoal: "",
    weightUnit: "kg",
    prevWeight: "",
    prevWeightUnit: "kg",
    currentWeight: "",
    currentWeightUnit: "kg",
    height: "",
    heightUnit: "cm",
    painLevel: 0,
    mood: "",
    hydration: "",
    nextFollowUp: "",
    reminders: { medication: false, meals: false, water: false },
  });

  const backgrounds = [
    "/assets/bg1.webp",
    "/assets/bg2.webp",
    "/assets/bg3.webp",
    "/assets/bg4.webp",
    "/assets/bg5.webp",
    "/assets/bg6.webp",
    "/assets/bg7.webp",
  ];

  // ------------------------------- Theme & Background
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

  // ------------------------------- Auth & Data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        await fetchPatientData(u.uid);
      } else {
        router.replace("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchPatientData = async (uid: string) => {
    try {
      const refDoc = doc(db, "patients", uid);
      const snap = await getDoc(refDoc);
      if (snap.exists()) {
        const data = snap.data();
        setProfile((prev: any) => ({
          ...prev,
          ...data,
          reminders: data.reminders || { medication: false, meals: false, water: false },
        }));
      }
    } catch (err) {
      console.error("❌ Error loading patient data:", err);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      const refDoc = doc(db, "patients", user.uid);
      await setDoc(refDoc, profile, { merge: true });
      alert("✅ Data saved successfully!");
    } catch (err) {
      console.error("❌ Error saving data:", err);
    }
  };

  // ------------------------------- Calculations
  const convertWeightToKg = (v: number, u: string) =>
    u === "lbs" ? v * 0.453592 : u === "st" ? v * 6.35029 : v;
  const convertHeightToMeters = (v: number, u: string) =>
    u === "cm" ? v / 100 : u === "in" ? v * 0.0254 : v;

  const calculateBMI = () => {
    if (!profile.currentWeight || !profile.height) return "";
    const weight = convertWeightToKg(Number(profile.currentWeight), profile.currentWeightUnit);
    const height = convertHeightToMeters(Number(profile.height), profile.heightUnit);
    return (weight / Math.pow(height, 2)).toFixed(1);
  };

  const weightLost =
    profile.prevWeight && profile.currentWeight
      ? (
          convertWeightToKg(Number(profile.prevWeight), profile.prevWeightUnit) -
          convertWeightToKg(Number(profile.currentWeight), profile.currentWeightUnit)
        ).toFixed(1)
      : "";

  const painDescription =
    profile.painLevel <= 2
      ? "No pain"
      : profile.painLevel <= 5
      ? "Mild discomfort"
      : profile.painLevel <= 8
      ? "Moderate pain"
      : "Severe pain — seek help";

  // ------------------------------- Chart Data
  const chartData = [
    { day: "Mon", bmi: 27.2, hydration: 85 },
    { day: "Tue", bmi: 26.9, hydration: 80 },
    { day: "Wed", bmi: 26.8, hydration: 82 },
    { day: "Thu", bmi: 26.7, hydration: 81 },
    { day: "Fri", bmi: 26.6, hydration: 79 },
  ];

  // ------------------------------- PDF Export
  const downloadPDF = () => {
    const docPDF = new jsPDF();
    const today = new Date().toLocaleDateString();
    const logo = "/postcare-logo-new.webp";

    docPDF.addImage(logo, "WEBP", 80, 10, 50, 50);
    docPDF.setFont("helvetica", "bold");
    docPDF.setFontSize(16);
    docPDF.setTextColor(106, 13, 173);
    docPDF.text("AI PostCare - Recovery Summary", 105, 70, { align: "center" });
    docPDF.setDrawColor(153, 102, 255);
    docPDF.line(30, 75, 180, 75);

    const data = [
      ["Full Name", profile.fullName || "—"],
      ["Gender", profile.gender || "—"],
      ["Date of Birth", profile.birthDate || "—"],
      ["Recovery Phase", profile.stage || "—"],
      ["Weight Goal", `${profile.weightGoal} ${profile.weightUnit}`],
      ["Previous Weight", `${profile.prevWeight} ${profile.prevWeightUnit}`],
      ["Current Weight", `${profile.currentWeight} ${profile.currentWeightUnit}`],
      ["Height", `${profile.height} ${profile.heightUnit}`],
      ["Pain Level", `${profile.painLevel}/10 (${painDescription})`],
      ["Mood", profile.mood || "—"],
      ["Hydration", profile.hydration || "—"],
      ["Next Follow-up", profile.nextFollowUp || "—"],
      ["Weight Lost", `${weightLost || "—"} kg`],
      ["BMI", calculateBMI() || "—"],
    ];

    autoTable(docPDF, {
      startY: 85,
      head: [["Field", "Value"]],
      body: data,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [106, 13, 173], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 240, 255] },
    });

    const finalY = (docPDF as any).lastAutoTable.finalY + 15;
    docPDF.setFontSize(10);
    docPDF.text(`Generated on ${today}`, 105, finalY, { align: "center" });
    docPDF.save(`AI-PostCare-Report_${today}.pdf`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // ------------------------------- Loading
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-white dark:from-gray-900 dark:to-black">
        <p className="text-purple-600 dark:text-purple-300 font-medium animate-pulse">
          Checking your session...
        </p>
      </div>
    );

  // ------------------------------- RENDER
  return (
    <main
      className={`relative min-h-screen flex flex-col lg:flex-row transition-all duration-700 ${
        darkMode ? "dark bg-gray-900 text-gray-100" : ""
      }`}
      style={{
        backgroundImage: `url(${backgrounds[bgIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm"></div>

      {/* MAIN PANEL */}
      <div className="relative flex-1 p-6 z-10 overflow-y-auto">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/postcare-logo-new.webp"
              alt="AI PostCare Logo"
              width={85}
              height={85}
              className="rounded-full shadow-lg border-4 border-purple-200 dark:border-purple-700"
            />
            <div>
              <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                Patient Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Welcome back,{" "}
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  {user?.email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm">
            <Link href="/dashboard/home" className="text-purple-600 hover:underline">
              Home
            </Link>
            <Link href="/dashboard/doctor" className="text-purple-600 hover:underline">
              Doctor Dashboard
            </Link>
            <button onClick={handleLogout} className="bg-purple-600 text-white px-3 py-1 rounded-md">
              Log out
            </button>
            <button onClick={toggleTheme} className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={changeBackground} className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full">
              Change Background
            </button>
            <LanguageSelector />
          </div>
        </header>

        {/* KEY METRICS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "BMI", value: calculateBMI() || "—" },
            { label: "Weight Lost (kg)", value: weightLost || "—" },
            { label: "Pain Level", value: `${profile.painLevel}/10` },
            { label: "Hydration", value: profile.hydration || "—" },
          ].map((m, i) => (
            <div
              key={i}
              className="bg-white/90 dark:bg-gray-800/90 border border-purple-200 dark:border-purple-700 rounded-xl shadow-md p-4 text-center"
            >
              <h3 className="text-sm text-gray-500">{m.label}</h3>
              <p className="text-xl font-semibold text-purple-700 dark:text-purple-300 mt-1">
                {m.value}
              </p>
            </div>
          ))}
        </section>

        {/* CHARTS */}
        <section className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-2xl shadow-md border border-purple-100 dark:border-purple-800 max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300">
            Progress Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bmi" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="hydration" stroke="#06B6D4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* ACTION BUTTONS */}
        <div className="flex justify-between max-w-3xl mx-auto mt-6">
          <button onClick={saveProfile} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md">
            Save Progress
          </button>
          <button
            onClick={downloadPDF}
            className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-5 py-2 rounded-md"
          >
            Download PDF Report
          </button>
        </div>

        {/* FILE UPLOAD */}
        {user && (
          <div className="max-w-3xl mx-auto mt-6">
            <FileUploader userId={user.uid} />
          </div>
        )}

        <footer className="mt-10 text-xs text-center text-gray-500 dark:text-gray-400">
          <b>AI PostCare</b> — Smart Care, Human Touch.
        </footer>
      </div>

      {/* AI ASSISTANT PANEL */}
      <aside className="relative z-10 w-full lg:w-1/3 bg-white/95 dark:bg-gray-800/95 border-t lg:border-l border-purple-100 dark:border-purple-800 p-4 shadow-inner backdrop-blur-md">
        <h2 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300 text-center">
          AIP Assistant
        </h2>
        <ChatIA />
      </aside>
    </main>
  );
}