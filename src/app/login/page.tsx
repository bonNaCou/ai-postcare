"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ChatIA from "../ChatIA";
import LanguageSelector from "@/components/LanguageSelector";

<header className="flex justify-between items-center mb-10">
  ...
  <LanguageSelector />
</header>


export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({
    stage: "",
    prevWeight: "",
    currentWeight: "",
    height: "",
    hydration: "",
    nextFollowUp: "",
  });
  const [bgIndex, setBgIndex] = useState<number>(0);
  const router = useRouter();

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

  // 🔄 Restore background selection
  useEffect(() => {
    const saved = localStorage.getItem("bgIndex");
    if (saved) setBgIndex(Number(saved));
  }, []);

  // 🔄 Change background
  const changeBackground = () => {
    const next = (bgIndex + 1) % backgrounds.length;
    setBgIndex(next);
    localStorage.setItem("bgIndex", next.toString());
  };

  // 🔐 Detect active session
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        await fetchPatientData(u.uid);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 📥 Fetch user data
  const fetchPatientData = async (uid: string) => {
    try {
      const ref = doc(db, "patients", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    } catch (err) {
      console.error("❌ Error loading patient data:", err);
    }
  };

  // 💾 Save user updates
  const saveProfile = async () => {
    if (!user) return;
    try {
      const ref = doc(db, "patients", user.uid);
      await setDoc(ref, profile, { merge: true });
      alert("✅ Data saved successfully!");
    } catch (err) {
      console.error("❌ Error saving data:", err);
    }
  };

  // 🧮 Calculate BMI
  const calculateBMI = () => {
    if (!profile.currentWeight || !profile.height) return "";
    const bmi =
      Number(profile.currentWeight) / Math.pow(Number(profile.height), 2);
    return bmi.toFixed(1);
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // 🕐 Loading
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-white">
        <p className="text-purple-600 font-medium animate-pulse">
          Checking your session...
        </p>
      </div>
    );

  // 🩺 Recovery Phases
  const recoveryPhases = [
    { value: "phase1", label: "Phase 1 – Clear Liquids" },
    { value: "phase2", label: "Phase 2 – Full Liquids" },
    { value: "phase3", label: "Phase 3 – Pureed Foods" },
    { value: "phase4", label: "Phase 4 – Soft Foods" },
    { value: "phase5", label: "Phase 5 – Solid Foods" },
  ];

  const weightLost =
    profile.prevWeight && profile.currentWeight
      ? Number(profile.prevWeight) - Number(profile.currentWeight)
      : "";

  return (
    <main
      className="relative min-h-screen transition-all duration-700 flex"
      style={{
        backgroundImage: `url(${backgrounds[bgIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

      {/* Left panel */}
      <div className="relative flex-1 p-8 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image
              src="/postcare-logo-new.webp"
              alt="AI PostCare Logo"
              width={110}
              height={110}
              className="rounded-full shadow-lg border-4 border-purple-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-purple-700 drop-shadow-sm">
                Patient Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back,{" "}
                <span className="text-purple-600 font-semibold">
                  {user?.displayName || user?.email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <Link
              href="/dashboard/doctor"
              className="text-purple-600 hover:underline text-sm mb-2"
            >
              👩‍⚕️ Doctor Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-md text-sm transition"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Summary */}
        <p className="text-gray-700 mb-6">
          Manage your post-surgery progress 💜  
          You can update your recovery data or sync it with your mobile health
          app (coming soon 📱).
        </p>

        {/* Recovery Summary Card */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-purple-100 max-w-lg">
          <h2 className="text-lg font-semibold mb-4 text-purple-700">
            🩺 My Recovery Summary
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
            {/* Phase */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Recovery Phase
              </label>
              <select
                value={profile.stage}
                onChange={(e) =>
                  setProfile({ ...profile, stage: e.target.value })
                }
                className="border border-purple-200 rounded-md p-2 w-full focus:ring-2 focus:ring-purple-300"
              >
                <option value="">Select your phase</option>
                {recoveryPhases.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Height (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={profile.height || ""}
                onChange={(e) =>
                  setProfile({ ...profile, height: e.target.value })
                }
                placeholder="e.g. 1.68"
                className="border border-purple-200 rounded-md p-2 w-full"
              />
            </div>

            {/* Previous Weight */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Previous Weight (kg)
              </label>
              <input
                type="number"
                value={profile.prevWeight || ""}
                onChange={(e) =>
                  setProfile({ ...profile, prevWeight: e.target.value })
                }
                placeholder="e.g. 118"
                className="border border-purple-200 rounded-md p-2 w-full"
              />
            </div>

            {/* Current Weight */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Current Weight (kg)
              </label>
              <input
                type="number"
                value={profile.currentWeight || ""}
                onChange={(e) =>
                  setProfile({ ...profile, currentWeight: e.target.value })
                }
                placeholder="e.g. 94"
                className="border border-purple-200 rounded-md p-2 w-full"
              />
            </div>

            {/* Hydration */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Hydration
              </label>
              <select
                value={profile.hydration}
                onChange={(e) =>
                  setProfile({ ...profile, hydration: e.target.value })
                }
                className="border border-purple-200 rounded-md p-2 w-full"
              >
                <option value="">Select</option>
                <option value="Excellent 💧💧💧">Excellent 💧💧💧</option>
                <option value="Good 💧💧">Good 💧💧</option>
                <option value="Low 💧">Low 💧</option>
              </select>
            </div>

            {/* Next Follow-up */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Next Follow-up
              </label>
              <input
                type="date"
                value={profile.nextFollowUp || ""}
                onChange={(e) =>
                  setProfile({ ...profile, nextFollowUp: e.target.value })
                }
                className="border border-purple-200 rounded-md p-2 w-full"
              />
            </div>
          </div>

          {/* Results */}
          <div className="mt-6 border-t pt-4 text-sm text-gray-700 space-y-1">
            <p>
              <b>Weight Lost:</b> {weightLost || "—"} kg
            </p>
            <p>
              <b>BMI:</b> {calculateBMI() || "—"}
            </p>
          </div>

          {/* Save */}
          <button
            onClick={saveProfile}
            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            Save Progress
          </button>

          <button
            onClick={changeBackground}
            className="mt-3 text-xs text-purple-500 hover:text-purple-700 transition underline underline-offset-4 block mx-auto"
          >
            Change Background Theme
          </button>

          <p className="mt-3 text-xs text-gray-500 text-center">
            Coming soon: Sync with Apple Health & Google Fit 📱
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-sm text-gray-500">
          <b>AI PostCare</b> — Smart Care, Human Touch.
        </footer>
      </div>

      {/* Right panel: AI Assistant */}
      <aside className="relative z-10 w-1/3 bg-white/90 border-l border-purple-100 p-6 shadow-inner backdrop-blur-md">
        <h2 className="text-lg font-semibold mb-4 text-purple-700">
          🤖 AI Assistant
        </h2>
        <ChatIA />
      </aside>
    </main>
  );
}
