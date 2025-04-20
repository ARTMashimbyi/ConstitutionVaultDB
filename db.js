
const admin = require("firebase-admin");
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "constitutionvault-1b5d1.firebasestorage.app"
});

const db = admin.firestore();

module.exports = { db };