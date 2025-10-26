"use client";
import React, { useState } from "react";

export default function ChatBox() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectedDialect, setDetectedDialect] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = { role: "user" as const, text: input };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Muestra dialecto detectado si existe
      if (data.dialectDetected) {
        setDetectedDialect(
          data.dialectDetected.charAt(0).toUpperCase() +
            data.dialectDetected.slice(1)
        );
      } else {
        setDetectedDialect(null);
      }

      const aiReply = { role: "assistant" as const, text: data.reply };
      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error("❌ Chat error:", error);
      const errMsg = {
        role: "assistant" as const,
        text: "⚠️ Error connecting to AI PostCare. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-4 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-purple-600 mb-2">
        💬 AI PostCare Assistant
      </h2>

      {detectedDialect && (
        <div className="mb-3 text-sm bg-purple-100 text-purple-800 rounded-lg px-3 py-1 w-fit">
          🧠 Detected dialect: <strong>{detectedDialect}</strong> 💜
        </div>
      )}

      <div className="flex flex-col space-y-3 h-[400px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${
              m.role === "user"
                ? "text-right text-purple-700"
                : "text-left text-gray-800 dark:text-gray-100"
            }`}
          >
            <p
              className={`inline-block px-4 py-2 rounded-2xl ${
                m.role === "user"
                  ? "bg-purple-200 dark:bg-purple-700"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-xl focus:outline-purple-500 dark:bg-gray-800 dark:text-white"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}
