const express = require("express"); 
const db = require("../config/db.js"); // ✅ นำเข้า db ที่ถูกต้อง
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const socketIo = require("socket.io");
const socket = require("../socket");
const io = socket.getIO();


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
            "SELECT id, username, role, address, phone_number, email, profile_image FROM users WHERE id = ?",
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
        const { fullName, phone, address, email, profileImage } = req.body; // ✅ เพิ่ม email และ profileImage

        const connection = await db.getConnection();
        await connection.query(
            "UPDATE users SET username = ?, phone_number = ?, address = ?, email = ?, profile_image = ? WHERE id = ?",
            [fullName, phone, address, email, profileImage, userId]
        );
        connection.release();

        res.json({ message: "✅ Profile updated successfully" });
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

/**
 * 📌 API ดึงข้อมูลผู้ใช้ทั้งหมด
 * @route GET /api/users
 */
router.get("/", async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, username, email, role FROM users");
        res.json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error });
    }
});

/**
 * 📌 API ลบผู้ใช้
 * @route DELETE /api/users/:id
 */
router.delete("/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        await db.query("DELETE FROM users WHERE id = ?", [userId]);
        res.json({ message: "✅ ลบผู้ใช้สำเร็จ" });
    } catch (error) {
        console.error("❌ Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user", error });
    }
});

//เพิ่มผู้ใช้
router.post("/", async (req, res) => {
    try {
        const { username, email, role, password } = req.body;
        if (!username || !email || !role || !password) {
            return res.status(400).json({ message: "❌ กรุณากรอกข้อมูลให้ครบ" });
        }

        console.log("📌 ข้อมูลที่รับมา:", req.body);

        const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "❌ อีเมลนี้ถูกใช้งานแล้ว" });
        }

        const [result] = await db.query(
            "INSERT INTO users (username, email, role, password) VALUES (?, ?, ?, ?)",
            [username, email, role, password]
        );

        console.log("✅ เพิ่มผู้ใช้สำเร็จ:", result);

        res.status(201).json({
            id: result.insertId,
            username,
            email,
            role,
        });
    } catch (error) {
        console.error("❌ Error adding user:", error);
        res.status(500).json({ message: "❌ เกิดข้อผิดพลาดในการเพิ่มผู้ใช้", error: error.message });
    }
});

// 📌 API สำหรับดึงเมนูอาหารทั้งหมด
router.get("/menus", async (req, res) => {
    try {
        const [menus] = await db.query("SELECT * FROM menus");
        res.json(menus);
    } catch (error) {
        res.status(500).json({ message: "❌ ไม่สามารถโหลดเมนูอาหารได้" });
    }
});

// 📌 API สำหรับบันทึกคำสั่งซื้อ
router.post("/order", async (req, res) => {
    try {
        const { table_id, menu_id, quantity, total_price } = req.body;
        await db.query(
            "INSERT INTO orders (table_id, menu_id, quantity, status, total_price, payment_status) VALUES (?, ?, ?, 'pending', ?, 'unpaid')",
            [table_id, menu_id, quantity, total_price]
        );

        // 📡 ส่งข้อมูลคำสั่งซื้อไปยังพนักงานผ่าน Socket.io
        io.emit("newOrder", { table_id, menu_id, quantity });

        res.json({ message: "✅ คำสั่งซื้อถูกบันทึกแล้ว!" });
    } catch (error) {
        res.status(500).json({ message: "❌ ไม่สามารถบันทึกคำสั่งซื้อได้" });
    }
});

// 📌 API สำหรับดึงคำสั่งซื้อของโต๊ะ
router.get("/orders/:table_id", async (req, res) => {
    try {
        const { table_id } = req.params;
        const [orders] = await db.query("SELECT * FROM orders WHERE table_id = ?", [table_id]);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลคำสั่งซื้อได้" });
    }
});

module.exports = router;
