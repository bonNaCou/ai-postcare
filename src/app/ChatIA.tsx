"use client";

import { useState, useRef } from "react";
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
  const [detectedDialect, setDetectedDialect] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // 🔒 Contexto médico interno (no visible)
  const patientContext = {
    phase: "Phase 3 – Solid Foods",
    weightLoss: "25 kg",
    alertLevel: "Stable",
  };

  // 🎙️ Iniciar o detener reconocimiento de voz
  const handleVoice = () => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("🎤 Voice recognition not supported in this browser.");
        return;
      }

      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang =
        (
          {
            en: "en-US",
            es: "es-ES",
            fr: "fr-FR",
            gl: "gl-ES",
            pcm: "en-NG",
            ig: "ig-NG",
            ha: "ha-NG",
            yo: "yo-NG",
            zh: "zh-CN",
          } as Record<string, string>
        )[lang] || "en-US";

      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error("🎤 Voice error:", e);
      setIsListening(false);
    }
  };

  // 🔊 Reproducir respuesta en voz
  const speakResponse = (text: string, langCode: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      (
        {
          en: "en-US",
          es: "es-ES",
          fr: "fr-FR",
          gl: "gl-ES",
          pcm: "en-NG",
          ig: "ig-NG",
          ha: "ha-NG",
          yo: "yo-NG",
          zh: "zh-CN",
        } as Record<string, string>
      )[langCode] || "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
  };

  // 💬 Enviar mensaje a la IA
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const newMessages: Msg[] = [...messages, { role: "user" as const, text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          lang,
          context: patientContext,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const updatedMessages: Msg[] = [
        ...newMessages,
        { role: "assistant" as const, text: data.reply },
      ];
      setMessages(updatedMessages);
      setDetectedDialect(data.dialectDetected || null);

      // 🧠 Reproducir respuesta en voz
      speakResponse(data.reply, lang);

      // 💾 Guardar en Firestore
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
        { role: "assistant" as const, text: "⚠️ Connection error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
      {/* 🌍 Idioma y dialecto */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <label className="text-sm text-gray-600">Language:</label>
          <select
            className="border rounded px-2 py-1 ml-2 text-sm"
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
        {detectedDialect && (
          <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium">
            🧠 Detected dialect: {detectedDialect}
          </div>
        )}
      </div>

      {/* 💬 Chat */}
      <div className="flex-1 overflow-y-auto border rounded bg-gray-50 dark:bg-neutral-800 p-3 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}
          >
            <p
              className={`inline-block px-3 py-2 rounded-lg whitespace-pre-line ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-neutral-700 dark:text-white"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
        {loading && <p className="text-gray-400 text-sm">💭 Generating response...</p>}
      </div>

      {/* 🧠 Entrada */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak your question…"
          className="border p-2 rounded flex-1 dark:bg-neutral-800 dark:text-white"
        />
        <button
          onClick={handleVoice}
          disabled={loading}
          className={`${
            isListening
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          } px-3 py-2 rounded`}
        >
          {isListening ? "🛑 Stop" : "🎤 Speak"}
        </button>
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
