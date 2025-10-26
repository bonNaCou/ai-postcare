import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export const runtime = "nodejs";

// --- ✅ CORS helper ---
function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

type Msg = { role: "user" | "assistant"; text: string };

export async function POST(req: NextRequest) {
  try {
    const { messages, lang, context } = (await req.json()) as {
      messages: Msg[];
      lang?: string;
      context?: { phase: string; weightLoss: string; alertLevel: string };
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return cors(
        NextResponse.json(
          { error: "Server missing GEMINI_API_KEY" },
          { status: 500 }
        )
      );

    // --- 1️⃣ Load dialect glossary from Firestore ---
    const glossaryRef = doc(db, "dialect_glossary", "phrases");
    const glossarySnap = await getDoc(glossaryRef);
    const glossaryData = glossarySnap.exists() ? glossarySnap.data().data : {};

    const userMsg = messages[messages.length - 1].text.toLowerCase();
    let dialectDetected: string | null = null;
    let translatedText = userMsg;

    for (const dialect of Object.keys(glossaryData)) {
      const phrases = glossaryData[dialect];
      for (const [key, value] of Object.entries(phrases)) {
        if (userMsg.includes(key.toLowerCase())) {
          dialectDetected = dialect;
          translatedText = value as string;
          break;
        }
      }
      if (dialectDetected) break;
    }

    // --- 2️⃣ Supported languages map ---
    const LANGUAGES: Record<string, string> = {
      auto: "Auto",
      en: "English",
      es: "Spanish",
      fr: "French",
      gl: "Galician",
      pcm: "Nigerian Pidgin",
      ig: "Igbo",
      ha: "Hausa",
      yo: "Yoruba",
      zh: "Chinese (Simplified)",
    };
    const langCode = lang && LANGUAGES[lang] ? lang : "auto";
    const langLabel = LANGUAGES[langCode];

    // --- 3️⃣ Gemini setup ---
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // --- 4️⃣ Patient context ---
    const phase = context?.phase || "Phase 3 – Solid Foods";
    const weightLoss = context?.weightLoss || "25 kg";
    const alertLevel = context?.alertLevel || "Stable";

    // --- 5️⃣ Build system prompt ---
    const systemPrompt = `
You are AI PostCare — an empathetic, multilingual virtual assistant specialized in post-bariatric care.

CONTEXT:
• Recovery phase: ${phase}
• Weight lost: ${weightLoss}
• Alert level: ${alertLevel}

LANGUAGE POLICY:
• If language = "auto", detect automatically and respond naturally in the detected language.
• Support dialects (Pidgin, Yoruba, Igbo, Hausa, Galician). If unknown, reply in English but add: "(Learning your dialect 💜🧠)".
• Use a warm, reassuring, professional tone — like a caring nurse or doctor, never robotic.

MEDICAL SAFETY:
• If symptoms like fever, vomiting, bleeding, dehydration, or severe pain appear → advise to contact a doctor immediately.
• Keep messages short, empathetic, and practical.

Conversation:
${messages.map((m) => `${m.role.toUpperCase()}: ${m.text}`).join("\n")}

Detected dialect: ${dialectDetected || "none"}
Translated text: ${translatedText}
Reply now in the detected or user language only.
`;

    const result = await model.generateContent(systemPrompt);
    const reply = result.response.text();

    // --- 6️⃣ Save learning ---
    if (dialectDetected && translatedText !== userMsg) {
      await setDoc(doc(db, "dialect_learning", crypto.randomUUID()), {
        text: userMsg,
        detectedLang: dialectDetected,
        reply,
        createdAt: serverTimestamp(),
      });
    }

    return cors(
      NextResponse.json({
        reply,
        dialectDetected,
      })
    );
  } catch (err: any) {
    console.error("❌ AI PostCare error:", err);
    return cors(
      NextResponse.json(
        { error: "⚠️ Failed to generate AI response", details: String(err?.message || err) },
        { status: 500 }
      )
    );
  }
}