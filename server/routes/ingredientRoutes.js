const express = require("express");
const router = express.Router();
const db = require("../config/db.js");

// ✅ ดึงข้อมูลวัตถุดิบทั้งหมด พร้อม Pagination
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, searchTerm = "", category = "" } = req.query;
    const offset = (page - 1) * limit;

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
    const [rows] = await db.query(sql, params);

    const countSql = `
      SELECT COUNT(*) AS total FROM ingredients 
      WHERE (ingredient_name LIKE ? OR ? = '')
      AND (category_id = ? OR ? = '');
    `;
    const [countRows] = await db.query(countSql, [`%${searchTerm}%`, searchTerm, category, category]);

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

// ✅ ดึงข้อมูลทั้งหมดของวัตถุดิบ
router.get("/inventory", async (req, res) => {
  try {
    const [ingredients] = await db.query("SELECT * FROM ingredients");
    res.json(ingredients);
  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ" });
  }
});

// ✅ เพิ่ม/อัปเดตวัตถุดิบ
router.post("/", async (req, res) => {
  const { ingredient_name, category_id, quantity } = req.body;

  if (!ingredient_name || !category_id || !quantity) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    let quantityInGrams = parseFloat(quantity); // ✅ ไม่ต้องคูณ 1000 เพราะค่าเป็นกรัมแล้ว

    // ตรวจสอบว่ามีวัตถุดิบนี้อยู่แล้วหรือไม่
    const [existingIngredients] = await db.query(
      "SELECT ingredient_id, quantity FROM ingredients WHERE ingredient_name = ?",
      [ingredient_name]
    );

    if (existingIngredients.length > 0) {
      const existingQuantity = parseFloat(existingIngredients[0].quantity);
      const newQuantity = existingQuantity + quantityInGrams;

      await db.query("UPDATE ingredients SET quantity = ? WHERE ingredient_id = ?", [
        newQuantity,
        existingIngredients[0].ingredient_id,
      ]);

      res.json({ success: true, message: "อัปเดตจำนวนวัตถุดิบสำเร็จ!" });
    } else {
      await db.query(
        "INSERT INTO ingredients (ingredient_name, category_id, quantity) VALUES (?, ?, ?)",
        [ingredient_name, category_id, quantityInGrams]
      );

      res.status(201).json({ success: true, message: "เพิ่มวัตถุดิบใหม่สำเร็จ!" });
    }
  } catch (error) {
    console.error("❌ Error adding/updating ingredient:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่ม/อัปเดตวัตถุดิบ" });
  }
});

module.exports = router;
