"use client";

type KPISectionProps = {
  profile: any;
  setProfile?: (p: any) => void;
};

export default function KPISection({ profile, setProfile }: KPISectionProps) {
  const bmi = profile?.bmi || "—";
  const hydration = profile?.hydration || "—";
  const weightLost = profile?.weightLost || "—";

  return (
    <section className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 mb-6 border border-purple-100 dark:border-neutral-700">
      <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4">
        Key Health Metrics
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg bg-purple-50 dark:bg-neutral-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">BMI</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{bmi}</p>
        </div>

        <div className="p-4 rounded-lg bg-purple-50 dark:bg-neutral-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Hydration</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{hydration}%</p>
        </div>

        <div className="p-4 rounded-lg bg-purple-50 dark:bg-neutral-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Weight Lost</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{weightLost} kg</p>
        </div>
      </div>
    </section>
  );
}