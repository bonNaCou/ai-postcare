import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { app, db } from "@/lib/firebaseConfig";


export const runtime = "nodejs";

// --- CORS helper ---
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
    if (!apiKey) {
      return cors(
        NextResponse.json(
          { error: "Server missing GEMINI_API_KEY" },
          { status: 500 }
        )
      );
    }

    // --- 1️⃣ Load dialect glossary ---
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
          translatedText = (value as string);
          break;
        }
      }
      if (dialectDetected) break;
    }

    // --- 2️⃣ Language table ---
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

    // --- 4️⃣ Prompt with hidden patient context ---
    const phase = context?.phase || "Phase 3 – Solid Foods";
    const weightLoss = context?.weightLoss || "25 kg";
    const alertLevel = context?.alertLevel || "Stable";

    const systemPrompt = `
You are **AI PostCare**, a multilingual, empathetic assistant for post-bariatric recovery.

CONTEXT:
- Patient phase: ${phase}
- Weight lost: ${weightLoss}
- Current alert level: ${alertLevel}

LANGUAGE POLICY:
- If "auto": detect the user's language and reply in that language.
- If a dialect (Pidgin, Yoruba, Galician, Igbo, Hausa) is detected, adapt to it. If unknown, respond in English + add “(Learning your dialect 💜🧠)”.
- Supported languages: English, Spanish, French, Galician, Nigerian Pidgin, Igbo, Hausa, Yoruba, Chinese.

const systemPrompt = 
You are AI PostCare — a multilingual medical assistant for post-bariatric patients.
Your role is to speak naturally and clearly to patients, *not* to explain translation choices or provide meta-comments.
Detect the user’s language automatically and reply only in that same language, using a warm and empathetic medical tone.
Avoid showing English translations unless the user asks explicitly.

MEDICAL SAFETY:
- Always give clear, short, safe recovery tips.
- If user mentions red-flag symptoms (fever, vomiting, bleeding, pain, dehydration), instruct to contact their doctor immediately.

CONVERSATION:
${messages.map((m) => `${m.role.toUpperCase()}: ${m.text}`).join("\n")}

Detected dialect: ${dialectDetected || "none"}
Translated message: ${translatedText}

REPLY IN THE DETECTED LANGUAGE OR DIALECT ONLY:
`;

    const result = await model.generateContent(systemPrompt);
    const reply = result.response.text();

    // --- 5️⃣ Store new phrase if dialect found ---
    if (dialectDetected && translatedText !== userMsg) {
      const learningId = crypto.randomUUID();
      await setDoc(doc(db, "dialect_learning", learningId), {
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
        {
          error: "⚠️ Failed to generate AI response",
          details: String(err?.message || err),
        },
        { status: 500 }
      )
    );
  }
}
