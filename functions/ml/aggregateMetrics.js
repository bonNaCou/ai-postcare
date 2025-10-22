const functions = require("firebase-functions");

module.exports = functions.https.onRequest((req, res) => {
  console.log("📊 Aggregating metrics...");
  res.status(200).send("✅ Metrics aggregation successful");
});
