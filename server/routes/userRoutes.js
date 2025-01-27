const express = require("express");
const db = require("../config/db.js");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const socket = require("../socket");

module.exports = (io) => {
  const router = express.Router();

  // 📌 ตรวจสอบว่ามีโฟลเดอร์สำหรับเก็บไฟล์หรือไม่ ถ้าไม่มีให้สร้าง
  const uploadDir = path.join(__dirname, "../uploads/Userprofile");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 📌 กำหนดโฟลเดอร์สำหรับเก็บไฟล์ที่อัปโหลด
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, "profile_" + Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });
  // 📌 ดึงข้อมูลผู้ใช้ทั้งหมด
  router.get("/", async (req, res) => {
    try {
      const [users] = await db.query(
        "SELECT id, username, password, role, email, phone_number, address, profile_image FROM users"
      );
      res.json(users);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // 📌 อัปโหลดรูปโปรไฟล์
  router.post(
    "/upload-profile/:id",
    upload.single("profileImage"),
    async (req, res) => {
      try {
        const userId = req.params.id;
        if (!req.file) {
          return res.status(400).json({ message: "❌ กรุณาอัปโหลดไฟล์" });
        }

        const profileImageUrl = `/uploads/Userprofile/${req.file.filename}`;
        await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [
          profileImageUrl,
          userId,
        ]);

        res.json({ message: "✅ อัปโหลดรูปสำเร็จ", profileImageUrl });
      } catch (error) {
        console.error("❌ Error uploading profile image:", error);
        res.status(500).json({ message: "❌ อัปโหลดรูปไม่สำเร็จ" });
      }
    }
  );

  // 📌 ดึงข้อมูลโปรไฟล์ผู้ใช้
  router.get("/profile/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "❌ Invalid user ID" });
      }

      const [users] = await db.query(
        "SELECT id, username, role, address, phone_number, email, profile_image FROM users WHERE id = ?",
        [userId]
      );

      if (!users.length) {
        return res.status(404).json({ message: "❌ User not found" });
      }

      console.log("✅ ดึงข้อมูลผู้ใช้สำเร็จ:", users[0]); // ✅ Debug ข้อมูลที่ได้
      res.json(users[0]);
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      res
        .status(500)
        .json({ message: "Error fetching user profile", error: error.message });
    }
  });

  // 📌 อัปเดตข้อมูลโปรไฟล์ผู้ใช้
  router.put("/profile/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const { fullName, phone, address, email, profileImage } = req.body;
      await db.query(
        "UPDATE users SET username = ?, phone_number = ?, address = ?, email = ?, profile_image = ? WHERE id = ?",
        [fullName, phone, address, email, profileImage, userId]
      );
      res.json({ message: "✅ Profile updated successfully" });
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      res.status(500).json({ message: "Error updating profile", error });
    }
  });
  
  // 📌 เพิ่มผู้ใช้ใหม่ (สมัครสมาชิก)
  router.post("/", async (req, res) => {
    try {
      const { username, password, role, email, phone_number, address } = req.body;

      if (!username || !password || !role || !email) {
        return res.status(400).json({ message: "❌ กรุณากรอกข้อมูลให้ครบถ้วน" });
      }

      // ตรวจสอบว่ามีชื่อผู้ใช้ซ้ำหรือไม่
      const [existingUsers] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
      if (existingUsers.length) {
        return res.status(409).json({ message: "❌ ชื่อผู้ใช้มีอยู่แล้ว" });
      }

      // เพิ่มผู้ใช้ลงในฐานข้อมูล
      await db.query(
        "INSERT INTO users (username, password, role, email, phone_number, address) VALUES (?, ?, ?, ?, ?, ?)",
        [username, password, role, email, phone_number || "", address || ""]
      );

      res.status(201).json({ message: "✅ เพิ่มผู้ใช้สำเร็จ" });
    } catch (error) {
      console.error("❌ Error creating user:", error);
      res.status(500).json({ message: "❌ ไม่สามารถเพิ่มผู้ใช้ได้", error });
    }
  });

  // 📌 อัปเดตรหัสผ่าน
  router.put("/password/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const { currentPassword, newPassword } = req.body;

      const [users] = await db.query(
        "SELECT password FROM users WHERE id = ?",
        [userId]
      );
      if (!users.length) {
        return res.status(404).json({ message: "❌ ไม่พบผู้ใช้" });
      }

      const storedPassword = users[0].password;
      if (currentPassword !== storedPassword) {
        return res
          .status(400)
          .json({ message: "❌ รหัสผ่านปัจจุบันไม่ถูกต้อง" });
      }

      await db.query("UPDATE users SET password = ? WHERE id = ?", [
        newPassword,
        userId,
      ]);
      res.json({ message: "✅ เปลี่ยนรหัสผ่านเรียบร้อย!" });
    } catch (error) {
      console.error("❌ Error updating password:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
    }
  });

  const queryDB = async (sql, params = []) => {
    let connection;
    try {
      connection = await db.getConnection();
      const [rows] = await connection.query(sql, params);
      return rows;
    } catch (error) {
      console.error("❌ Database query error:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  };

  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      }

      const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
        username,
      ]);
      if (!users.length) {
        return res
          .status(401)
          .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }

      const user = users[0];

      res.json({
        message: "เข้าสู่ระบบสำเร็จ",
        user: { id: user.id, username: user.username, role: user.role },
      });
    } catch (error) {
      console.error("❌ Error logging in:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
    }
  });

  return router;
};
