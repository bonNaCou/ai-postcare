"use client";
import { useLanguageDetection } from "@/lib/hooks/useLanguageDetection";

export default function LanguageSelector() {
  const { changeLanguage, currentLang } = useLanguageDetection();
  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "gl", label: "Galego" },
    { code: "pidgin", label: "Pidgin" },
    { code: "ig", label: "Igbo" },
    { code: "yo", label: "Yoruba" },
    { code: "ha", label: "Hausa" },
    { code: "zh", label: "中文" }
  ];

  return (
    <div className="text-sm text-gray-600">
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="border border-purple-300 rounded-md p-1 bg-white text-gray-700"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
