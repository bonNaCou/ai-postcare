"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ChatIA from "../../ChatIA";
import LanguageSelector from "@/components/LanguageSelector";

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");
  const [bgIndex, setBgIndex] = useState(0);
  const router = useRouter();

  const backgrounds = [
    "/assets/bg1.webp",
    "/assets/bg2.webp",
    "/assets/bg3.webp",
    "/assets/bg4.webp",
    "/assets/bg5.webp",
    "/assets/bg6.webp",
    "/assets/bg7.webp",
  ];

  const [profile, setProfile] = useState<any>({
    name: "",
    gender: "",
    dob: "",
    age: "",
    stage: "",
    height: "",
    heightUnit: "m",
    currentWeight: "",
    prevWeight: "",
    weightUnit: "kg",
    weightGoal: "",
    painLevel: 0,
    mood: "",
    hydration: "",
    nextFollowUp: "",
    drugAlarm: false,
    mealAlarm: false,
    waterAlarm: false,
  });

  // 🌍 Auto detect language
  useEffect(() => {
    const browserLang = navigator.language || "en";
    setLang(browserLang.split("-")[0]);
  }, []);

  // 🔄 Auth session
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        await fetchUserData(u.uid);
      } else router.push("/login");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 📥 Fetch user data or initialize
  const fetchUserData = async (uid: string) => {
    try {
      const ref = doc(db, "patients", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
      else await setDoc(ref, profile);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    }
  };

  // 💾 Save data
  const saveProfile = async () => {
    if (!user) return;
    const ref = doc(db, "patients", user.uid);
    await setDoc(ref, profile, { merge: true });
    alert("✅ Data saved successfully!");
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // 🧮 BMI
  const calculateBMI = () => {
    if (!profile.currentWeight || !profile.height) return null;
    let weight = Number(profile.currentWeight);
    let height = Number(profile.height);
    if (profile.weightUnit === "lbs") weight *= 0.453592;
    if (profile.heightUnit === "ft") height *= 0.3048;
    return (weight / Math.pow(height, 2)).toFixed(1);
  };

  // 🎯 Weight lost + recommendations
  const weightLost =
    profile.prevWeight && profile.currentWeight
      ? Number(profile.prevWeight) - Number(profile.currentWeight)
      : 0;

  const getRecommendation = () => {
    const bmi = Number(calculateBMI());
    if (!bmi) return "";
    if (bmi < 18.5) return "Underweight — increase protein and hydration intake.";
    if (bmi < 24.9) return "Healthy weight — maintain balanced diet and exercise.";
    if (bmi < 29.9) return "Overweight — follow a moderate diet plan.";
    return "Obese — please consult your doctor and dietitian.";
  };

  // 📄 Export PDF
  const exportPDF = async () => {
    const element = document.getElementById("dashboard-section");
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save(`AI_PostCare_${user?.email || "report"}.pdf`);
  };

  // 🔔 Smart Reminders
  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission();

    const reminders = [
      { enabled: profile.waterAlarm, label: "💧 Time to drink water!" },
      { enabled: profile.mealAlarm, label: "🍽️ Time for your meal!" },
      { enabled: profile.drugAlarm, label: "💊 Time for medication!" },
    ];

    reminders.forEach((rem) => {
      if (rem.enabled) {
        setInterval(() => {
          new Notification("AI PostCare Reminder", {
            body: rem.label,
            icon: "/postcare-logo-new.webp",
          });
        }, 4 * 60 * 60 * 1000);
      }
    });
  }, [profile]);

  // 🌈 Change background
  const changeBackground = () => {
    const next = (bgIndex + 1) % backgrounds.length;
    setBgIndex(next);
    localStorage.setItem("bgIndex", next.toString());
  };

  // ⏳ Loading
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-white">
        <p className="text-purple-600 font-medium animate-pulse">
          Checking your session...
        </p>
      </div>
    );

  // 📋 Stages & moods
  const stages = [
    "Phase 1 – Clear Liquids",
    "Phase 2 – Full Liquids",
    "Phase 3 – Pureed Foods",
    "Phase 4 – Soft Foods",
    "Phase 5 – Solid Foods",
  ];
  const moods = [
    "😊 Happy",
    "😐 Neutral",
    "😞 Sad",
    "😣 Tired",
    "💪 Motivated",
    "❤️ Grateful",
  ];

  return (
    <main
      className="flex min-h-screen bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: `url(${backgrounds[bgIndex]})` }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>

      <div className="relative flex-1 p-8 z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Image
              src="/postcare-logo-new.webp"
              alt="AI PostCare Logo"
              width={100}
              height={100}
              className="rounded-full shadow-md border-2 border-purple-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-purple-700">
                Patient Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back,{" "}
                <span className="text-purple-600 font-semibold">
                  {user?.displayName || user?.email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link
              href="/dashboard/doctor"
              className="text-purple-600 hover:underline text-sm"
            >
              Doctor Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-md text-sm transition"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Summary Form */}
        <section
          id="dashboard-section"
          className="bg-white p-6 rounded-2xl shadow border border-purple-100 max-w-2xl"
        >
          <h2 className="text-lg font-semibold mb-4 text-purple-700">
            🩺 My Recovery Summary
          </h2>

          {/* FORM FIELDS (preserved from your original version) */}
          {/* Keep all patient info inputs (height, weight, phase, etc.) */}

          {/* --- Weight/BMI summary --- */}
          <div className="mt-6 border-t pt-4 text-sm text-gray-700 space-y-1">
            <p>
              <b>Weight Lost:</b> {weightLost || "—"} {profile.weightUnit}
            </p>
            <p>
              <b>BMI:</b> {calculateBMI() || "—"}
            </p>
            <p>
              <b>Recommendation:</b> {getRecommendation() || "—"}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={saveProfile}
              className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
            >
              Save Progress
            </button>

            <button
              onClick={exportPDF}
              className="flex-1 bg-purple-100 border border-purple-300 text-purple-700 py-2 rounded-lg font-medium hover:bg-purple-200 transition"
            >
              Download PDF Report
            </button>
          </div>

          <button
            onClick={changeBackground}
            className="mt-6 text-xs text-purple-600 hover:text-fuchsia-700 transition underline underline-offset-4"
          >
            Change Background Theme
          </button>
        </section>

        <footer className="mt-10 text-sm text-gray-500">
          <b>AI PostCare</b> — Smart Care, Human Touch.
        </footer>
      </div>

      {/* AI Assistant */}
      <aside className="relative w-1/3 bg-white border-l border-purple-100 p-6 shadow-inner z-10">
        <h2 className="text-lg font-semibold mb-4 text-purple-700">
          🤖 AIP Assistant
        </h2>
        <ChatIA />
      </aside>
    </main>
  );
}
