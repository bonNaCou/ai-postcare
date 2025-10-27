"use client";

/*  
==============================================================
 🩺 AI POSTCARE – PATIENT DASHBOARD
==============================================================
 • Full Firebase integration (auth + Firestore)
 • Personalized user data (no defaults shared between users)
 • Animated UI using Framer Motion
 • Multilingual support (LanguageSelector)
 • PDF export via jsPDF + autoTable
 • Responsive line chart (BMI + Hydration)
 • Toast notifications for success/errors
 • Fully responsive layout (mobile / tablet / desktop)
==============================================================
*/

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ChatIA from "../../ChatIA";
import LanguageSelector from "@/components/LanguageSelector";
import FileUploader from "@/components/FileUploader";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

// Chart.js setup
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function PatientDashboard() {
  const { t } = useTranslation();
  const router = useRouter();

  /* ------------------------------------------------------------
   🔧 STATE MANAGEMENT
  ------------------------------------------------------------ */
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [bmiHistory, setBmiHistory] = useState<number[]>([]);
  const [hydrationHistory, setHydrationHistory] = useState<number[]>([]);

  const [profile, setProfile] = useState<any>({
    fullName: "",
    gender: "",
    birthDate: "",
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
    stage: "",
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

  /* ------------------------------------------------------------
   🎨 THEME & BACKGROUND LOGIC
  ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
   🔐 AUTHENTICATION + FIRESTORE FETCH
  ------------------------------------------------------------ */
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
        setBmiHistory(data.bmiHistory || []);
        setHydrationHistory(data.hydrationHistory || []);
      }
    } catch (err) {
      console.error("❌ Error loading patient data:", err);
      toast.error("Error loading your profile");
    }
  };

  /* ------------------------------------------------------------
   💾 SAVE PROFILE DATA
  ------------------------------------------------------------ */
  const saveProfile = async () => {
    if (!user) return;
    try {
      const bmiValue = Number(calculateBMI());
      const hydrationValue =
        profile.hydration === "Excellent" ? 100 : profile.hydration === "Good" ? 80 : 60;

      const updatedBmiHistory = [...bmiHistory.slice(-4), bmiValue];
      const updatedHydrationHistory = [...hydrationHistory.slice(-4), hydrationValue];

      const refDoc = doc(db, "patients", user.uid);
      await setDoc(
        refDoc,
        { ...profile, bmiHistory: updatedBmiHistory, hydrationHistory: updatedHydrationHistory },
        { merge: true }
      );

      setBmiHistory(updatedBmiHistory);
      setHydrationHistory(updatedHydrationHistory);
      toast.success("✅ Progress saved successfully!");
    } catch (err) {
      console.error("❌ Error saving data:", err);
      toast.error("Failed to save your progress.");
    }
  };

  /* ------------------------------------------------------------
   ⚖️ BMI + CONVERSIONS
  ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
   🧾 GENERATE PDF SUMMARY
  ------------------------------------------------------------ */
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
      ["Pain Level (0–10)", profile.painLevel],
      ["Mood", profile.mood],
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

  /* ------------------------------------------------------------
   🚪 LOGOUT
  ------------------------------------------------------------ */
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  /* ------------------------------------------------------------
   ⏳ LOADING STATE
  ------------------------------------------------------------ */
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-white dark:from-gray-900 dark:to-black">
        <p className="text-purple-600 dark:text-purple-300 font-medium animate-pulse">
          Checking your session...
        </p>
      </div>
    );

  /* ------------------------------------------------------------
   🧭 MAIN DASHBOARD UI
  ------------------------------------------------------------ */
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
      <Toaster
        position={
          typeof window !== "undefined" && window.innerWidth < 768
            ? "bottom-center"
            : "top-right"
        }
        reverseOrder={false}
      />

      {/* BACKGROUND OVERLAY */}
      <div className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm"></div>

      {/* LEFT PANEL */}
      <div className="relative flex-1 p-6 z-10 overflow-y-auto">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/postcare-logo-new.webp"
              alt="AI PostCare Logo"
              width={90}
              height={90}
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

          {/* NAVIGATION + THEME */}
          <div className="flex flex-col items-end gap-2 text-sm">
            <Link href="/dashboard/home" className="text-purple-600">
              Home
            </Link>
            <Link href="/dashboard/doctor" className="text-purple-600">
              Doctor Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-purple-600 text-white px-3 py-1 rounded-md"
            >
              Log out
            </button>
            <button
              onClick={toggleTheme}
              className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full"
            >
              {darkMode ? "🌞" : "🌙"}
            </button>
            <button
              onClick={changeBackground}
              className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full"
            >
              Change Background
            </button>
            <LanguageSelector />
          </div>
        </header>

        {/* INTRO TEXT */}
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Manage your post-surgery progress 💜 — track your health, set goals,
          upload medical reports, and get smart advice from AI PostCare.
        </p>

        {/* UPLOAD MEDICAL FILES */}
        {user && <FileUploader userId={user.uid} />}

        {/* ------------------------------------------------------------
         🩺 MY RECOVERY SUMMARY FORM
        ------------------------------------------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-2xl shadow-md border border-purple-100 dark:border-purple-800 max-w-2xl mx-auto mt-6"
        >
          <h2 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300">
            🩺 My Recovery Summary
          </h2>

          {/* FORM FIELDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* BASIC INFO */}
            {[
              { label: "Full Name", key: "fullName", type: "text" },
              { label: "Date of Birth", key: "birthDate", type: "date" },
            ].map((item) => (
              <div key={item.key}>
                <label>{item.label}</label>
                <input
                  type={item.type}
                  value={profile[item.key]}
                  onChange={(e) => setProfile({ ...profile, [item.key]: e.target.value })}
                  className="border border-purple-200 dark:border-purple-700 dark:bg-gray-900 rounded-md p-2 w-full"
                />
              </div>
            ))}

            {/* GENDER SELECT */}
            <div>
              <label>Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="border border-purple-200 dark:border-purple-700 dark:bg-gray-900 rounded-md p-2 w-full"
              >
                <option value="">Select</option>
                <option value="male">♂ Male</option>
                <option value="female">♀ Female</option>
                <option value="non-binary">⚧ Non-binary</option>
                <option value="prefer-not">🙈 Prefer not to say</option>
              </select>
            </div>

            {/* RECOVERY PHASE */}
            <div>
              <label>Recovery Phase</label>
              <select
                value={profile.stage}
                onChange={(e) => setProfile({ ...profile, stage: e.target.value })}
                className="border border-purple-200 dark:border-purple-700 dark:bg-gray-900 rounded-md p-2 w-full"
              >
                <option value="">Select phase</option>
                <option value="Phase 1 – Clear Liquids">Phase 1 – Clear Liquids</option>
                <option value="Phase 2 – Full Liquids">Phase 2 – Full Liquids</option>
                <option value="Phase 3 – Pureed Foods">Phase 3 – Pureed Foods</option>
                <option value="Phase 4 – Soft Foods">Phase 4 – Soft Foods</option>
                <option value="Phase 5 – Solid Foods">Phase 5 – Solid Foods</option>
              </select>
            </div>

            {/* WEIGHT / HEIGHT INPUTS WITH UNITS */}
            {[
              { label: "Previous Weight", key: "prevWeight", unitKey: "prevWeightUnit" },
              { label: "Current Weight", key: "currentWeight", unitKey: "currentWeightUnit" },
              { label: "Weight Goal", key: "weightGoal", unitKey: "weightUnit" },
              { label: "Height", key: "height", unitKey: "heightUnit" },
            ].map((field) => (
              <div key={field.key}>
                <label>{field.label}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={profile[field.key]}
                    onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                    className="border border-purple-200 dark:border-purple-700 dark:bg-gray-900 rounded-md p-2 w-full"
                  />
                  <select
                    value={profile[field.unitKey]}
                    onChange={(e) =>
                      setProfile({ ...profile, [field.unitKey]: e.target.value })
                    }
                    className="border border-purple-200 dark:border-purple-700 dark:bg-gray-900 rounded-md p-2"
                  >
                    {field.key === "height"
                      ? ["cm", "in", "m"].map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))
                      : ["kg", "lbs", "st"].map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
            ))}

            {/* PAIN LEVEL SLIDER */}
            <div className="col-span-2">
              <label>Pain Level (0–10)</label>
              <input
                type="range" min="0"
                max="10"
                value={profile.painLevel}
                onChange={(e) =>
                  setProfile({ ...profile, painLevel: Number(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {profile.painLevel}/10 - Pain intensity
              </p>
            </div>

            {/* MOOD SELECT */}
            <div>
              <label>Mood</label>
              <select
                value={profile.mood}
                onChange={(e) => setProfile({ ...profile, mood: e.target.value })}
                className="border border-purple-200 dark:border-purple-700 dark:bg-gray-900 rounded-md p-2 w-full"
              >
                <option value="">Select mood</option>
                <option value="Happy">😊 Happy</option>
                <option value="Motivated">💪 Motivated</option>
                <option value="Calm">😌 Calm</option>
                <option value="Tired">😴 Tired</option>
                <option value="Anxious">😟 Anxious</option>
                <option value="Frustrated">😤 Frustrated</option>
                <option value="Sad">😢 Sad</option>
                <option value="Grateful">🙏 Grateful</option>
                <option value="Energetic">⚡ Energetic</option>
                <option value="In pain">🤕 In pain</option>
              </select>
            </div>

            {/* HYDRATION SELECT */}
            <div>
              <label>Hydration</label>
              <select
                value={profile.hydration}
                onChange={(e) => setProfile({ ...profile, hydration: e.target.value })}
                className="border border-purple-200 dark:border-purple-700 dark:bg-gray-900 rounded-md p-2 w-full"
              >
                <option value="">Select Hydration Level</option>
                <option value="Excellent">Excellent💧💧💧</option>
                <option value="Good">Good💧💧</option>
                <option value="Low">Low💧</option>
              </select>
            </div>

            {/* NEXT FOLLOW-UP */}
            <div className="col-span-2">
              <label>Next Follow-up</label>
              <input
                type="date"
                value={profile.nextFollowUp}
                onChange={(e) =>
                  setProfile({ ...profile, nextFollowUp: e.target.value })
                }
                className="border border-purple-200 dark:border-purple-700 dark:bg-gray-900 rounded-md p-2 w-full"
              />
            </div>

            {/* RESULTS + RECOMMENDATION */}
            <div className="col-span-2 border-t pt-4 space-y-1">
              <p>
                <b>Weight Lost:</b> {weightLost || "—"} kg
              </p>
              <p>
                <b>BMI:</b> {calculateBMI() || "—"}
              </p>
              <p>
                <b>Recommendation:</b>{" "}
                {calculateBMI()
                  ? Number(calculateBMI()) < 18.5
                    ? "Eat more protein and increase calorie intake 🥑"
                    : Number(calculateBMI()) < 25
                    ? "You're maintaining a healthy weight ✅"
                    : "Try light activity and track your meals 🧘‍♀️"
                  : "Update your weight and height to see suggestions."}
              </p>
            </div>

            {/* HEALTH REMINDERS */}
            <div className="col-span-2 border-t pt-4">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                🩹 Health Reminders
              </h3>
              {[
                { key: "medication", label: "Take Medications 💊" },
                { key: "meals", label: "Eat Regular Meals 🍲" },
                { key: "water", label: "Drink Water 💧" },
              ].map((r) => (
                <label key={r.key} className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={profile.reminders[r.key]}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        reminders: {
                          ...profile.reminders,
                          [r.key]: e.target.checked,
                        },
                      })
                    }
                  />
                  {r.label}
                </label>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="col-span-2 mt-6 flex justify-between flex-wrap gap-3">
              <button
                onClick={saveProfile}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md"
              >
                💾 Save Progress
              </button>
              <button
                onClick={downloadPDF}
                className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-5 py-2 rounded-md"
              >
                📄 Download PDF Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* ------------------------------------------------------------
         ⚖️ KEY HEALTH METRICS + PROGRESS CHART
        ------------------------------------------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-10 max-w-3xl mx-auto"
        >
          <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4">
            ⚖️ Key Health Metrics
          </h2>

          {/* FOUR SMALL METRIC CARDS */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "BMI", value: calculateBMI() || "—" },
              { label: "Weight Lost (kg)", value: weightLost || "—" },
              { label: "Pain Level", value: `${profile.painLevel}/10` },
              { label: "Hydration", value: profile.hydration || "—" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center border border-purple-100 dark:border-purple-700 hover:shadow-lg transition-all duration-300"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {item.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* PROGRESS LINE CHART */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-purple-100 dark:border-purple-700"
          >
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4">
              📈 Progress Overview
            </h3>

            <Line
              data={{
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                datasets: [
                  {
                    label: "BMI",
                    data: bmiHistory.length
                      ? bmiHistory
                      : Array(5).fill(Number(calculateBMI()) || 0),
                    borderColor: "#8B5CF6",
                    backgroundColor: (ctx) => {
                      const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250);
                      gradient.addColorStop(0, "rgba(139, 92, 246, 0.4)");
                      gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
                      return gradient;
                    },
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: "#8B5CF6",
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: "Hydration",
                    data: hydrationHistory.length
                      ? hydrationHistory
                      : [80, 85, 90, 88, 86],
                    borderColor: "#3B82F6",
                    backgroundColor: (ctx) => {
                      const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250);
                      gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
                      gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
                      return gradient;
                    },
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: "#3B82F6",
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                      color: "#6B21A8",
                      boxWidth: 10,
                      usePointStyle: true,
                      font: { size: 12 },
                    },
                  },
                  tooltip: { mode: "index", intersect: false },
                },
                interaction: { mode: "nearest", intersect: false },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0,0,0,0.1)" },
                    ticks: { color: "#6B21A8" },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: "#6B21A8" },
                  },
                },
              }}
            />
          </motion.div>
        </motion.div>

        {/* FOOTER */}
        <footer className="mt-10 text-xs text-center text-gray-500 dark:text-gray-400">
          <b>AI PostCare</b> — Smart Care, Human Touch 💜
        </footer>
      </div>

      {/* ------------------------------------------------------------
       🤖 RIGHT PANEL – AI ASSISTANT
      ------------------------------------------------------------ */}
      <aside className="relative z-10 w-full lg:w-1/3 bg-white/90 dark:bg-gray-800/90 border-t lg:border-l border-purple-100 dark:border-purple-800 p-4 shadow-inner backdrop-blur-md">
        <h2 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300 text-center">
          AIP Assistant
        </h2>
        <ChatIA />
      </aside>
    </main>
  );
}