"use client";
import { useTranslation } from "react-i18next";

export function useTherapyAI() {
  const { t } = useTranslation();

  async function generateTherapyResponse(input: string): Promise<string> {
    const lower = input.toLowerCase();
    if (lower.includes("sad") || lower.includes("tired"))
      return t("therapySad") || "I’m sorry you feel that way. Remember to rest and hydrate.";
    if (lower.includes("pain"))
      return t("therapyPain") || "Pain can be difficult. Monitor your symptoms and contact your doctor if needed.";
    if (lower.includes("happy"))
      return t("therapyHappy") || "That’s wonderful! Keep this positive energy.";
    return t("therapyGeneral") || "I understand. How are you feeling overall today?";
  }

  return { generateTherapyResponse };
}