// db.js
require("dotenv").config();
const admin = require("firebase-admin");

class FirestoreSingleton {
  constructor() {
    if (!FirestoreSingleton.instance) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });

      this.db = admin.firestore();
      FirestoreSingleton.instance = this;
    }

    return FirestoreSingleton.instance;
  }

  getDB() {
    return this.db;
  }
}

const firestoreInstance = new FirestoreSingleton();
Object.freeze(firestoreInstance);

module.exports = firestoreInstance.getDB();
