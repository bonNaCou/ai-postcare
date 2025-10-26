export function calculateBMI(weight: number, weightUnit: string, height: number, heightUnit: string) {
  if (!weight || !height) return "";
  const w = weightUnit === "lbs" ? weight * 0.453592 : weightUnit === "st" ? weight * 6.35029 : weight;
  const h = heightUnit === "cm" ? height / 100 : heightUnit === "in" ? height * 0.0254 : height;
  return (w / (h * h)).toFixed(1);
}

export function aiTipsGenerator(bmi: number | string) {
  const val = typeof bmi === "string" ? parseFloat(bmi) : bmi;
  if (!val) return "Keep monitoring your recovery daily.";
  if (val < 18.5) return "Increase protein intake and eat small frequent meals.";
  if (val < 24.9) return "You are maintaining a healthy balance.";
  if (val < 29.9) return "Incorporate light physical activity and monitor diet.";
  return "Consult your healthcare provider for a personalized plan.";
}