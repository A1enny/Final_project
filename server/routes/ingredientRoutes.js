const express = require("express");
const router = express.Router();
const db = require("../config/db.js");

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, searchTerm = "", category = "" } = req.query;
    const offset = (page - 1) * limit;

    console.log("📢 Fetching ingredients...");
    console.log("✅ Params:", { page, limit, searchTerm, category });

    const sql = `
      SELECT i.ingredient_id, i.ingredient_name, i.quantity, 
             c.category_id, c.category_name 
      FROM ingredients i
      LEFT JOIN categories c ON i.category_id = c.category_id
      WHERE (i.ingredient_name LIKE ? OR ? = '')
      AND (i.category_id = ? OR ? = '')
      LIMIT ? OFFSET ?;
    `;
    const params = [`%${searchTerm}%`, searchTerm, category, category, parseInt(limit), parseInt(offset)];

    console.log("📌 SQL Query:", sql);
    console.log("📌 SQL Params:", params);

    // ✅ ใช้ `const [rows]` แทน `const [results]`
    const [rows] = await db.query(sql, params);
    if (!Array.isArray(rows)) {
      console.error("❌ Error: Query did not return an array", rows);
      return res.status(500).json({ error: "Database query error" });
    }

    console.log("✅ Ingredients Results:", rows);

    // ✅ ดึงจำนวนวัตถุดิบทั้งหมด (สำหรับ Pagination)
    const countSql = `
      SELECT COUNT(*) AS total FROM ingredients 
      WHERE (ingredient_name LIKE ? OR ? = '')
      AND (category_id = ? OR ? = '');
    `;
    const [countRows] = await db.query(countSql, [`%${searchTerm}%`, searchTerm, category, category]);

    if (!Array.isArray(countRows) || countRows.length === 0) {
      console.error("❌ Error: Count query failed", countRows);
      return res.status(500).json({ error: "Error fetching ingredient count" });
    }

    console.log("✅ Total Ingredients:", countRows[0].total);

    res.json({
      results: rows,
      totalPages: Math.ceil(countRows[0].total / limit),
      currentPage: parseInt(page),
    });

  } catch (error) {
    console.error("❌ Error fetching ingredients:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ", details: error.message });
  }
});

module.exports = router;
