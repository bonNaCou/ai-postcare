"use client";
import { useEffect } from "react";
import { PatientProfile } from "@/lib/hooks/useUserData";

export default function AlarmManager({ profile }: { profile: PatientProfile }) {
  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission();
    const intervals: NodeJS.Timeout[] = [];

    const schedule = (label: string, enabled?: boolean) => {
      if (!enabled) return;
      const id = setInterval(() => {
        new Notification("AI PostCare Reminder", { body: label });
      }, 4 * 60 * 60 * 1000);
      intervals.push(id);
    };

    schedule("Time for medication", profile.drugAlarm);
    schedule("Time for meal", profile.mealAlarm);
    schedule("Drink some water", profile.waterAlarm);

    return () => intervals.forEach(clearInterval);
  }, [profile]);

  return null;
}
