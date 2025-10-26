"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ChartsSectionProps = {
  profile: any;
};

export default function ChartsSection({ profile }: ChartsSectionProps) {
  const sampleData = [
    { day: "Mon", bmi: 27.2, hydration: 85 },
    { day: "Tue", bmi: 26.9, hydration: 80 },
    { day: "Wed", bmi: 26.8, hydration: 82 },
    { day: "Thu", bmi: 26.5, hydration: 83 },
    { day: "Fri", bmi: 26.3, hydration: 84 },
  ];

  return (
    <section className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 mb-6 border border-purple-100 dark:border-neutral-700">
      <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4">
        Progress Overview
      </h3>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={sampleData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="bmi"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="BMI"
            />
            <Line
              type="monotone"
              dataKey="hydration"
              stroke="#60A5FA"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Hydration"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}