const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = functions.auth.user().onCreate(async (user) => {
  try {
    await db.collection("users").doc(user.uid).set({
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "New Patient",
      gender: "",
      age: "",
      height: "",
      weight: "",
      bmi: "",
      painLevel: 0,
      mood: "neutral",
      hydration: "Good",
      medicationReminders: [],
      recoveryStage: "Liquid",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ User profile created: ${user.email}`);
  } catch (error) {
    console.error("❌ Error creating user profile:", error);
  }
});
