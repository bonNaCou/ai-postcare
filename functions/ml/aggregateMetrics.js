const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = functions.pubsub.schedule("every 24 hours").onRun(async () => {
  const users = await db.collection("users").get();
  let totalWeightLost = 0;
  let count = 0;

  users.forEach((doc) => {
    const data = doc.data();
    if (data.previousWeight && data.currentWeight) {
      totalWeightLost += data.previousWeight - data.currentWeight;
      count++;
    }
  });

  const avgLoss = count > 0 ? totalWeightLost / count : 0;
  await db.collection("metrics").doc("dailyStats").set({
    avgWeightLost: avgLoss,
    totalUsers: count,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("📊 Metrics aggregated successfully");
});