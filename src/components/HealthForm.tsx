"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { predictBMI } from "@/lib/ml/predictBMI";
import { PatientProfile } from "@/lib/hooks/useUserData";

interface Props {
  profile: PatientProfile;
  onSave: (updates: Partial<PatientProfile>) => Promise<void>;
}

export default function HealthForm({ profile, onSave }: Props) {
  const { t } = useTranslation();
  const [predicted, setPredicted] = useState<number | null>(null);

  async function handleSave() {
    const res = await predictBMI(
      Number(profile.currentWeight ?? 0),
      Number(profile.height ?? 0),
      profile.bmiHistory || [20, 22, 23]
    );

    if (res.predicted !== null) setPredicted(res.predicted);

    await onSave({
      ...profile,
      bmiHistory: [...(profile.bmiHistory || []), res.bmi ?? 0],
    });

    alert(t("save") || "Saved!");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
        <div>
          <label className="block text-gray-600 mb-1">{t("height")}</label>
          <input
            type="number"
            value={profile.height ?? ""}
            onChange={(e) => onSave({ height: +e.target.value })}
            className="border rounded-md p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">{t("weight")}</label>
          <input
            type="number"
            value={profile.currentWeight ?? ""}
            onChange={(e) => onSave({ currentWeight: +e.target.value })}
            className="border rounded-md p-2 w-full"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md"
      >
        {t("save")}
      </button>

      {predicted && (
        <p className="text-sm text-gray-700">
          {t("bmi")}: <b>{predicted}</b> ({t("prediction") || "Predicted BMI trend"})
        </p>
      )}
    </div>
  );
}