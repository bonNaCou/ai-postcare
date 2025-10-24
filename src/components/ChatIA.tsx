"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useVoiceAI } from "@/lib/hooks/useVoiceAI";
import { useTherapyAI } from "@/lib/hooks/useTherapyAI";

export default function ChatIA() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { speak } = useVoiceAI();
  const { generateTherapyResponse } = useTherapyAI();

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, `You: ${input}`]);
    const reply = await generateTherapyResponse(input);
    setMessages((m) => [...m, `AI: ${reply}`]);
    speak(reply);
    setInput("");
  };

  return (
    <div className="bg-white border border-purple-100 rounded-lg p-4 shadow-inner">
      <h3 className="text-purple-700 font-semibold mb-3">
        {t("assistant") || "AI Assistant"}
      </h3>
      <div className="h-64 overflow-y-auto border rounded-md p-2 mb-3 bg-gray-50 text-sm text-gray-700">
        {messages.map((m, i) => (
          <p key={i} className="mb-1">
            {m}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("typeHere") || "Type your message..."}
          className="flex-1 border rounded-md p-2 text-sm"
        />
        <button
          onClick={sendMessage}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-md text-sm"
        >
          {t("send") || "Send"}
        </button>
      </div>
    </div>
  );
}