const mysql = require("mysql2/promise"); // ✅ ใช้ mysql2/promise

// ✅ สร้าง MySQL Connection Pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // ✅ ตรวจสอบรหัสผ่านให้ถูกต้อง
    database: "maw_db",
    waitForConnections: true,
    connectionLimit: 10, // ✅ จำกัดจำนวนการเชื่อมต่อ
    queueLimit: 0,
});

// ✅ ตรวจสอบการเชื่อมต่อ MySQL
(async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ MySQL Connected");
        connection.release(); // ✅ ปล่อย connection กลับเข้า pool
    } catch (err) {
        console.error("❌ MySQL Connection Error:", err.message);
        process.exit(1); // ❌ หยุดเซิร์ฟเวอร์ถ้าเชื่อมต่อไม่ได้
    }
})();

module.exports = db; // ✅ ต้อง export db
