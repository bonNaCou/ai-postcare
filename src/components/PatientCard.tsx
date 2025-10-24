"use client";
import { useTranslation } from "react-i18next";

interface Props {
  name: string;
  stage?: string;
  weight?: number;
  height?: number;
  status?: string;
  onSelect?: () => void;
}

export default function PatientCard({
  name,
  stage,
  weight,
  height,
  status,
  onSelect,
}: Props) {
  const { t } = useTranslation();
  return (
    <div
      onClick={onSelect}
      className="cursor-pointer bg-white border border-purple-100 shadow-sm rounded-lg p-4 hover:bg-purple-50 transition"
    >
      <h3 className="text-lg font-semibold text-purple-700">{name}</h3>
      <p className="text-sm text-gray-600">
        {t("phase")}: {stage || t("unknown")}
      </p>
      <p className="text-sm">
        {t("weight")}: {weight || "—"} kg | {t("height")}: {height || "—"} m
      </p>
      <p
        className={`text-xs font-medium mt-1 ${
          status === "recovering"
            ? "text-green-600"
            : status === "critical"
            ? "text-red-500"
            : "text-gray-500"
        }`}
      >
        {status || t("status")}
      </p>
    </div>
  );
}