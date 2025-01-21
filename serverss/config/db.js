// const mysql = require("mysql2");
// require("dotenv").config();
// console.log("🔍 ENV Loaded:", process.env.DB_HOST);

// const pool = mysql.createPool({
//     host: "localhost",    // ใช้ localhost เพราะ MySQL รันในเครื่อง
//     user: "root",         // User ค่าเริ่มต้นของ XAMPP
//     password: "",         // ค่าเริ่มต้นของ XAMPP คือค่าว่าง (ถ้ามีรหัสให้ใส่)
//     database: "maw_db", // ชื่อฐานข้อมูลที่สร้างใน phpMyAdmin
//     port: 3306,           // พอร์ต MySQL เริ่มต้นของ XAMPP
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// // ทดสอบการเชื่อมต่อ MySQL
// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error("❌ MySQL Connection Failed:", err.message);
//     } else {
//         console.log("✅ Connected to MySQL Database");
//         connection.release();
//     }
// });

// module.exports = pool.promise();
