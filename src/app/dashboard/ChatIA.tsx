"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

type Msg = { role: "user" | "assistant"; text: string };

export const LANGUAGES = {
  auto: "Auto",
  en: "English",
  es: "Español",
  fr: "Français",
  gl: "Gallego",
  pcm: "Nigerian Pidgin",
  ig: "Igbo",
  ha: "Hausa",
  yo: "Yorùbá",
  zh: "中文（简体）",
} as const;

export default function ChatIA() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<keyof typeof LANGUAGES>("auto");
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [detectedDialect, setDetectedDialect] = useState<string | null>(null);

  const patientContext = {
    phase: "Phase 3 – Soft Foods",
    weightLoss: "25 kg",
    alertLevel: "Stable",
  };

  // 🔊 Speak message aloud
  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();

    // Pick voice based on gender
    let selectedVoice = voices.find((v) =>
      voiceGender === "female"
        ? v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("susan") ||
          v.name.toLowerCase().includes("samantha")
        : v.name.toLowerCase().includes("male") ||
          v.name.toLowerCase().includes("daniel") ||
          v.name.toLowerCase().includes("alex")
    );

    utterance.voice = selectedVoice || voices[0];
    utterance.rate = 1.0;
    utterance.pitch = voiceGender === "female" ? 1.1 : 0.9;
    utterance.volume = 1;
    synth.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const newMessages: Msg[] = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, lang, context: patientContext }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const updatedMessages: Msg[] = [
        ...newMessages,
        { role: "assistant", text: data.reply },
      ];
      setMessages(updatedMessages);
      setDetectedDialect(data.dialectDetected || null);

      // 🗣️ Speak the assistant’s reply
      speak(data.reply);

      await addDoc(collection(db, "chats"), {
        messages: updatedMessages,
        lang,
        dialectDetected: data.dialectDetected || null,
        timestamp: new Date(),
      });
    } catch (e) {
      console.error("❌ Chat error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Connection error, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
      {/* Language & Voice Selector */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Language:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={lang}
            onChange={(e) => setLang(e.target.value as keyof typeof LANGUAGES)}
          >
            {Object.entries(LANGUAGES).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Voice:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={voiceGender}
            onChange={(e) => setVoiceGender(e.target.value as "female" | "male")}
          >
            <option value="female">Female (Empathetic)</option>
            <option value="male">Male (Calm)</option>
          </select>
        </div>
      </div>

      {/* Detected dialect */}
      {detectedDialect && (
        <div className="mb-3 bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium">
          Detected dialect: {detectedDialect}
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto border rounded bg-gray-50 dark:bg-neutral-800 p-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
            <p
              className={`inline-block px-3 py-2 rounded-lg whitespace-pre-line ${
                m.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 dark:bg-neutral-700 dark:text-white"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
        {loading && <p className="text-gray-400 text-sm italic">Generating response...</p>}
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="border p-2 rounded flex-1 dark:bg-neutral-800 dark:text-white"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}