const mysql = require("mysql2/promise"); // ✅ ใช้ mysql2/promise

// ✅ สร้าง MySQL Connection Pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // ตรวจสอบรหัสผ่านให้ถูกต้อง
    database: "maw_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// ✅ ตรวจสอบการเชื่อมต่อ MySQL
db.getConnection()
  .then((connection) => {
    console.log("✅ MySQL Connected");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ MySQL Connection Error:", err);
  });

module.exports = db; // ✅ ต้อง export db
