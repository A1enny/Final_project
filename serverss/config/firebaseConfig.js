// ✅ ใช้ require() แทน import เพื่อให้รองรับ CommonJS
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // 🔥 ตรวจสอบให้แน่ใจว่าไฟล์นี้มีอยู่จริง!

// ✅ ตั้งค่า Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAymUqzmSaZ2Z_tokzuHoJSIKfvWmLgOgU",
  authDomain: "restaurant-management-63d49.firebaseapp.com",
  projectId: "restaurant-management-63d49",
  storageBucket: "restaurant-management-63d49.appspot.com", // ✅ แก้ URL ของ Storage ให้ถูกต้อง
  messagingSenderId: "25924795817",
  appId: "1:25924795817:web:ff2b5e801e83a5cf4758b8",
  measurementId: "G-9L1572GQCF",
};

// ✅ Initialize Firebase Client SDK
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://restaurant-management-63d49.firebaseio.com",
});

const adminDb = admin.firestore(); // ✅ Firestore Database จาก Firebase Admin SDK

// ✅ Export เพื่อให้ใช้ในโปรเจกต์ได้ง่าย
module.exports = { db, auth, adminDb };
