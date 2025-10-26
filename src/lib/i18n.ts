// src/lib/i18n.ts
"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 🌍 Traducciones básicas (puedes ampliar con tus archivos JSON después)
const resources = {
  en: {
    translation: {
      welcome: "Welcome to AI PostCare",
      login: "Login",
      register: "Register",
    },
  },
  es: {
    translation: {
      welcome: "Bienvenido a AI PostCare",
      login: "Iniciar sesión",
      register: "Registrar",
    },
  },
  fr: {
    translation: {
      welcome: "Bienvenue sur AI PostCare",
      login: "Se connecter",
      register: "S’inscrire",
    },
  },
  gl: {
    translation: {
      welcome: "Benvido a AI PostCare",
      login: "Iniciar sesión",
      register: "Rexistrarse",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "es", "fr", "gl", "pcm", "ig", "ha", "yo", "zh"],
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator"],
      caches: ["localStorage", "cookie"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
