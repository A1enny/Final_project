const express = require("express");
const db = require("../config/db.js"); // ✅ นำเข้า db ที่ถูกต้อง
const router = express.Router();

/**
 * 📌 1. ดึงข้อมูลโปรไฟล์ผู้ใช้ (ไม่ใช้ Token)
 * @route GET /api/users/profile/:id
 */
router.get("/profile/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        console.log("📌 API ถูกเรียกใช้กับ user_id:", userId);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "❌ Invalid user ID" });
        }

        const connection = await db.getConnection(); // ✅ ใช้ getConnection()
        const [users] = await connection.query(
            "SELECT id, username, role, address, phone_number,email FROM users WHERE id = ?",
            [userId]
        );
        connection.release(); // ✅ ต้องคืน connection

        if (!users.length) {
            return res.status(404).json({ message: "❌ User not found" });
        }

        res.json(users[0]);
    } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
});

/**
 * 📌 2. อัปเดตข้อมูลโปรไฟล์ผู้ใช้ (ไม่ใช้ Token)
 * @route PUT /api/users/profile/:id
 */
router.put("/profile/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { fullName, phone, address } = req.body; // 🔥 ลบ email ออกถ้าไม่มีในตาราง

        const connection = await db.getConnection();
        await connection.query(
            "UPDATE users SET username = ?, phone_number = ?, address = ? WHERE id = ?",
            [fullName, phone, address, userId]
        );
        connection.release();

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("❌ Error updating profile:", error);
        res.status(500).json({ message: "Error updating profile", error });
    }
});


/**
 * 📌 3. อัปเดตรหัสผ่าน (ไม่ใช้ Token)
 * @route PUT /api/users/change-password/:id
 */
router.put("/password/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "❌ กรุณากรอกรหัสผ่านให้ครบถ้วน" });
        }

        // ดึงรหัสผ่านปัจจุบันจากฐานข้อมูล
        const [users] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);

        if (!users.length) {
            return res.status(404).json({ message: "❌ ไม่พบผู้ใช้" });
        }

        const storedPassword = users[0].password;

        // ✅ ตรวจสอบรหัสผ่านปัจจุบัน
        if (currentPassword !== storedPassword) {
            return res.status(400).json({ message: "❌ รหัสผ่านปัจจุบันไม่ถูกต้อง" });
        }

        // ✅ อัปเดตรหัสผ่านใหม่
        await db.query("UPDATE users SET password = ? WHERE id = ?", [newPassword, userId]);

        res.json({ message: "✅ เปลี่ยนรหัสผ่านเรียบร้อย!" });

    } catch (error) {
        console.error("❌ Error updating password:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
    }
});


module.exports = router;
