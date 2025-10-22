const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    console.log("🔔 Sending daily reminders...");

    const users = await db.collection("users").get();
    users.forEach((doc) => {
      const user = doc.data();
      console.log(`Reminder sent to ${user.email}`);
    });

    return null;
  });
