const express = require("express");
const router = express.Router();
const db = require("../config/db.js");

// ✅ ดึงข้อมูลหมวดหมู่ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const sql = "SELECT category_id, category_name FROM categories ORDER BY category_name ASC";
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error("❌ Database Query Error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบ" });
  }
});

module.exports = router;
