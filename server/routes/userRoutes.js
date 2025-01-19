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

  // 📌 อัปโหลดรูปโปรไฟล์
  router.post("/upload-profile/:id", upload.single("profileImage"), async (req, res) => {
    try {
      const userId = req.params.id;
      if (!req.file) {
        return res.status(400).json({ message: "❌ กรุณาอัปโหลดไฟล์" });
      }

      const profileImageUrl = `/uploads/Userprofile/${req.file.filename}`;
      await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [profileImageUrl, userId]);

      res.json({ message: "✅ อัปโหลดรูปสำเร็จ", profileImageUrl });
    } catch (error) {
      console.error("❌ Error uploading profile image:", error);
      res.status(500).json({ message: "❌ อัปโหลดรูปไม่สำเร็จ" });
    }
  });

  // 📌 ดึงข้อมูลโปรไฟล์ผู้ใช้
  router.get("/profile/:id", async (req, res) => {
    try {
      const userId = req.params.id;
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

      res.json(users[0]);
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      res.status(500).json({ message: "Error fetching user profile", error: error.message });
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

  // 📌 อัปเดตรหัสผ่าน
  router.put("/password/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const { currentPassword, newPassword } = req.body;

      const [users] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);
      if (!users.length) {
        return res.status(404).json({ message: "❌ ไม่พบผู้ใช้" });
      }

      const storedPassword = users[0].password;
      if (currentPassword !== storedPassword) {
        return res.status(400).json({ message: "❌ รหัสผ่านปัจจุบันไม่ถูกต้อง" });
      }

      await db.query("UPDATE users SET password = ? WHERE id = ?", [newPassword, userId]);
      res.json({ message: "✅ เปลี่ยนรหัสผ่านเรียบร้อย!" });
    } catch (error) {
      console.error("❌ Error updating password:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
    }
  });

  return router;
};
