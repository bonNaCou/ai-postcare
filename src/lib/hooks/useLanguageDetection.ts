"use client";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import i18n from "../i18n";

export function useLanguageDetection() {
  const { t } = useTranslation();

  useEffect(() => {
    const lang = localStorage.getItem("lang") || navigator.language.split("-")[0];
    i18n.changeLanguage(lang);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  return { t, changeLanguage, currentLang: i18n.language };
}
