import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";

export async function saveUnknownPhrase(text: string, detectedLang: string, reply: string) {
  try {
    await addDoc(collection(db, "dialect_learning"), {
      text,
      detectedLang,
      reply,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("Error saving dialect data:", err);
  }
}

export async function getGlossary() {
  try {
    const glossaryRef = doc(db, "dialect_glossary", "phrases");
    const glossarySnap = await getDoc(glossaryRef);
    return glossarySnap.exists() ? glossarySnap.data() : {};
  } catch (err) {
    console.error("Error getting glossary:", err);
    return {};
  }
}
