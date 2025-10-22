"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ChatIA from "../../ChatIA";
import LanguageSelector from "@/components/LanguageSelector";
<header className="flex justify-between items-center mb-10">

  <LanguageSelector />
</header>

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");
  const router = useRouter();

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

  // 🌍 Detect language automatically
  useEffect(() => {
    const browserLang = navigator.language || "en";
    setLang(browserLang.split("-")[0]);
  }, []);

  // 🔄 Detect active session
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

  // 📥 Fetch user data
  const fetchUserData = async (uid: string) => {
    try {
      const ref = doc(db, "patients", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    }
  };

  // 💾 Save user data
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

  // 🧮 Calculate BMI
  const calculateBMI = () => {
    if (!profile.currentWeight || !profile.height) return null;

    let weight = Number(profile.currentWeight);
    let height = Number(profile.height);

    // convert to metric if user uses imperial
    if (profile.weightUnit === "lbs") weight = weight * 0.453592;
    if (profile.heightUnit === "ft") height = height * 0.3048;

    const bmi = weight / Math.pow(height, 2);
    return bmi.toFixed(1);
  };

  // 🎯 Calculate weight lost and recommendation
  const weightLost =
    profile.prevWeight && profile.currentWeight
      ? Number(profile.prevWeight) - Number(profile.currentWeight)
      : 0;

  const getRecommendation = () => {
    const bmi = Number(calculateBMI());
    if (!bmi) return "";
    if (bmi < 18.5) return "Underweight — consider more protein intake.";
    if (bmi < 24.9) return "Healthy weight — keep it up!";
    if (bmi < 29.9) return "Overweight — moderate diet and hydration.";
    return "Obese — follow medical and nutritional plan strictly.";
  };

  // ⏳ Loading screen
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-white">
        <p className="text-purple-600 font-medium animate-pulse">
          Checking your session...
        </p>
      </div>
    );

  // 📋 Recovery stages
  const stages = [
    "Phase 1 – Clear Liquids",
    "Phase 2 – Full Liquids",
    "Phase 3 – Pureed Foods",
    "Phase 4 – Soft Foods",
    "Phase 5 – Solid Foods",
  ];

  // 📊 Mood options
  const moods = [
    "😊 Happy",
    "😐 Neutral",
    "😞 Sad",
    "😣 Tired",
    "💪 Motivated",
    "❤️ Grateful",
  ];

  // 🌈 Pain scale colors
  const painColors = [
    "bg-green-300",
    "bg-yellow-300",
    "bg-orange-400",
    "bg-red-400",
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Left panel */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image
              src="/postcare-logo-new.webp"
              alt="AI PostCare Logo"
              width={120}
              height={120}
              className="rounded-full shadow-lg border-4 border-purple-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-purple-700">
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

        <p className="text-gray-700 mb-6">
          Manage your post-surgery progress 💜 — track your health, set goals,
          and receive intelligent guidance from AI PostCare.
        </p>

        {/* Patient Info */}
        <div className="bg-white p-6 rounded-2xl shadow border border-purple-100 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4 text-purple-700">
            🩺 My Recovery Summary
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
            {/* Basic Info */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name"
                className="border border-purple-200 rounded-md p-2 w-full"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Gender
              </label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="border border-purple-200 rounded-md p-2 w-full"
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Date of Birth
              </label>
              <input
                type="date"
                value={profile.dob || ""}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="border border-purple-200 rounded-md p-2 w-full"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Weight Goal ({profile.weightUnit})
              </label>
              <input
                type="number"
                value={profile.weightGoal || ""}
                onChange={(e) =>
                  setProfile({ ...profile, weightGoal: e.target.value })
                }
                placeholder="e.g. 70"
                className="border border-purple-200 rounded-md p-2 w-full"
              />
            </div>

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
                className="border border-purple-200 rounded-md p-2 w-full"
              >
                <option value="">Select your phase</option>
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Height ({profile.heightUnit})
              </label>
              <input
                type="number"
                step="0.01"
                value={profile.height || ""}
                onChange={(e) =>
                  setProfile({ ...profile, height: e.target.value })
                }
                placeholder="e.g. 1.70"
                className="border border-purple-200 rounded-md p-2 w-full"
              />
              <select
                value={profile.heightUnit}
                onChange={(e) =>
                  setProfile({ ...profile, heightUnit: e.target.value })
                }
                className="mt-1 text-xs border border-gray-200 rounded p-1"
              >
                <option value="m">Meters</option>
                <option value="ft">Feet</option>
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Current Weight ({profile.weightUnit})
              </label>
              <input
                type="number"
                value={profile.currentWeight || ""}
                onChange={(e) =>
                  setProfile({ ...profile, currentWeight: e.target.value })
                }
                placeholder="e.g. 79"
                className="border border-purple-200 rounded-md p-2 w-full"
              />
              <select
                value={profile.weightUnit}
                onChange={(e) =>
                  setProfile({ ...profile, weightUnit: e.target.value })
                }
                className="mt-1 text-xs border border-gray-200 rounded p-1"
              >
                <option value="kg">Kilograms</option>
                <option value="lbs">Pounds</option>
              </select>
            </div>

            {/* Pain Level */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Pain Level
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={profile.painLevel}
                onChange={(e) =>
                  setProfile({ ...profile, painLevel: e.target.value })
                }
                className="w-full accent-purple-500"
              />
              <p className="text-xs text-gray-500">
                {profile.painLevel}/10 — Pain intensity
              </p>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">Mood</label>
              <select
                value={profile.mood}
                onChange={(e) => setProfile({ ...profile, mood: e.target.value })}
                className="border border-purple-200 rounded-md p-2 w-full"
              >
                <option value="">Select mood</option>
                {moods.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
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

          {/* Summary */}
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

          {/* Alarms */}
          <div className="mt-4 border-t pt-3">
            <h3 className="font-semibold text-purple-700 text-sm mb-2">
              ⏰ Health Reminders
            </h3>
            <label className="block text-sm">
              <input
                type="checkbox"
                checked={profile.drugAlarm}
                onChange={(e) =>
                  setProfile({ ...profile, drugAlarm: e.target.checked })
                }
              />{" "}
              Take Medications
            </label>
            <label className="block text-sm">
              <input
                type="checkbox"
                checked={profile.mealAlarm}
                onChange={(e) =>
                  setProfile({ ...profile, mealAlarm: e.target.checked })
                }
              />{" "}
              Eat Meals
            </label>
            <label className="block text-sm">
              <input
                type="checkbox"
                checked={profile.waterAlarm}
                onChange={(e) =>
                  setProfile({ ...profile, waterAlarm: e.target.checked })
                }
              />{" "}
              Drink Water
            </label>
          </div>

          <button
            onClick={saveProfile}
            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            Save Progress
          </button>
        </div>

        <footer className="mt-10 text-sm text-gray-500">
          <b>AI PostCare</b> — Smart Care, Human Touch.
        </footer>
      </div>

      {/* AI Assistant */}
      <aside className="w-1/3 bg-white border-l border-purple-100 p-6 shadow-inner">
        <h2 className="text-lg font-semibold mb-4 text-purple-700">
          🤖 AI Assistant
        </h2>
        <ChatIA />
      </aside>
    </div>
  );
}
