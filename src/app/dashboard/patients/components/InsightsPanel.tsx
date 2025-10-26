"use client";

type InsightsPanelProps = {
  profile: any;
};

export default function InsightsPanel({ profile }: InsightsPanelProps) {
  const bmi = Number(profile?.bmi) || 0;

  let insight = "Update your profile to see insights.";
  if (bmi > 0 && bmi < 18.5)
    insight = "Your BMI is low. Consider increasing protein and calorie intake.";
  else if (bmi >= 18.5 && bmi < 25)
    insight = "You are maintaining a healthy BMI. Keep up your balanced routine.";
  else if (bmi >= 25)
    insight = "Your BMI is above the ideal range. Focus on consistent hydration and portion control.";

  return (
    <section className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 mb-6 border border-purple-100 dark:border-neutral-700">
      <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">
        Health Insights
      </h3>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
    </section>
  );
}