import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: [
      "en", "es", "fr", "gl", "pidgin", "ig", "yo", "ha", "zh"
    ],
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    resources: {}, // translations loaded automatically by Next.js
  });

export default i18n;
