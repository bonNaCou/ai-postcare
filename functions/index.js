/**
 * ✅ AI POSTCARE CLOUD FUNCTIONS ENTRY POINT
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUserProfile = require("./users/onCreateProfile");
exports.sendReminders = require("./notifications/sendReminders");
exports.aggregateMetrics = require("./ml/aggregateMetrics");
