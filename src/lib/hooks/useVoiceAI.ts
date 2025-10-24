"use client";

export function useVoiceAI() {
  function speak(text: string, lang = "en-US") {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.pitch = 1;
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  }

  return { speak };
}