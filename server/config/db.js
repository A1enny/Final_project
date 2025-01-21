const mysql = require("mysql2/promise");

// ✅ Create a MySQL connection pool
const db = mysql.createPool({
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

module.exports = db; // Export the pool for use in your app
