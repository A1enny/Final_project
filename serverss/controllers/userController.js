// const db = require("../config/db.js");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");

// // ✅ ฟังก์ชัน Login
// const login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // ✅ ตรวจสอบผู้ใช้จากฐานข้อมูล
//     const [users] = await db.query(
//       "SELECT * FROM users WHERE username = ?",
//       [username]
//     );

//     if (!users.length) {
//       return res.status(401).json({ message: "❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
//     }

//     const user = users[0];

//     // ✅ ตรวจสอบรหัสผ่านด้วย bcrypt
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
//     }

//     // ✅ สร้าง JWT Token
//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET || "default_secret",
//       { expiresIn: "1h" }
//     );

//     res.json({ token, user });
//   } catch (error) {
//     console.error("❌ Login Error:", error);
//     res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
//   }
// };

// // ✅ ตรวจสอบว่า `login` ถูก export ออกไปถูกต้อง
// module.exports = { login };
const db = require("../config/firebaseConfig");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // ✅ ค้นหาผู้ใช้ใน Firestore
    const usersRef = db.collection("users");
    const snapshot = await usersRef
      .where("username", "==", username)
      .where("password", "==", password)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: "❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    let user;
    snapshot.forEach((doc) => {
      user = { id: doc.id, ...doc.data() };
    });

    // ✅ สร้าง JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};
