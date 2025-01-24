const mysql = require("mysql2/promise");

// ✅ Create a MySQL connection pool
const db = mysql.createPool({
<<<<<<< HEAD
  connectionLimit: 10, // Maximum number of connections
  host: "localhost",
  user: "root",        // Replace with your MySQL username
  password: "",        // Replace with your MySQL password
  database: "maw_db",  // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

});

// ✅ Test the database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database Connection Error:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
  connection.release(); // Release the connection back to the pool
});
=======
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
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a

module.exports = db; // Export the pool for use in your app
