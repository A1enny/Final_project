const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // ไฟล์ Key จาก Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://restaurant-management-63d49-default-rtdb.asia-southeast1.firebasedatabase.app/", // เปลี่ยนเป็น project ของคุณ
});

const db = admin.firestore();

module.exports = { admin, db };
