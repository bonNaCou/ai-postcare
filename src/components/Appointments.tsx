"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Appointment {
  id: string;
  patient: string;
  date: string;
  notes: string;
}

export default function Appointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newApp, setNewApp] = useState({ patient: "", date: "", notes: "" });

  const addAppointment = () => {
    if (!newApp.patient || !newApp.date) return;
    setAppointments([
      ...appointments,
      { id: Date.now().toString(), ...newApp },
    ]);
    setNewApp({ patient: "", date: "", notes: "" });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 mt-6">
      <h2 className="text-lg font-semibold text-purple-700 mb-4">
        {t("appointments") || "Appointments"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          value={newApp.patient}
          onChange={(e) => setNewApp({ ...newApp, patient: e.target.value })}
          placeholder={t("patientName") || "Patient name"}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="date"
          value={newApp.date}
          onChange={(e) => setNewApp({ ...newApp, date: e.target.value })}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="text"
          value={newApp.notes}
          onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
          placeholder={t("notes") || "Notes"}
          className="border rounded-md p-2 w-full"
        />
      </div>

      <button
        onClick={addAppointment}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
      >
        {t("addAppointment") || "Add Appointment"}
      </button>

      <ul className="mt-4 space-y-2">
        {appointments.map((a) => (
          <li key={a.id} className="border-t pt-2">
            <p className="text-sm">
              <b>{a.patient}</b> — {a.date}
            </p>
            {a.notes && (
              <p className="text-xs text-gray-500">{a.notes}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}