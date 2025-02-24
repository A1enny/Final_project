const express = require("express");
const router = express.Router();
const db = require("../config/db.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📌 ตรวจสอบว่าโฟลเดอร์สำหรับเก็บรูปภาพมีหรือไม่ ถ้าไม่มีให้สร้าง
const uploadDir = path.join(__dirname, "../uploads/recipes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 📌 กำหนดโฟลเดอร์สำหรับเก็บไฟล์อัปโหลด
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, "recipe_" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ **เพิ่มสูตรอาหาร (POST /recipes)**
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { recipe_name, category_id, ingredients } = req.body;
    
    if (!recipe_name) {
      return res.status(400).json({ success: false, message: "กรุณาระบุชื่อสูตรอาหาร" });
    }

    let imagePath = req.file ? `/uploads/recipes/${req.file.filename}` : null;

    // ถ้า category_id ว่าง ให้ใช้ค่า NULL แทน
    const categoryValue = category_id && category_id !== "" ? category_id : null;

    // ✅ เพิ่มสูตรอาหารลงในฐานข้อมูล
    const [result] = await db.query(
      "INSERT INTO recipes (recipe_name, category_id, image) VALUES (?, ?, ?)",
      [recipe_name, categoryValue, imagePath]
    );

    const recipe_id = result.insertId;

    // ✅ เพิ่มวัตถุดิบลงในฐานข้อมูล
    const ingredientList = JSON.parse(ingredients);
    for (const ing of ingredientList) {
      await db.query(
        "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (?, ?, ?)",
        [recipe_id, ing.ingredient_id, ing.quantity]
      );
    }

    res.json({ success: true, message: "เพิ่มสูตรอาหารสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error adding recipe:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเพิ่มสูตรอาหาร" });
  }
});

// ✅ **ลบสูตรอาหาร**
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`🛑 กำลังลบสูตรอาหาร ID: ${id}`);

  try {
    await db.query("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);
    await db.query("DELETE FROM menus WHERE recipe_id = ?", [id]);

    const [result] = await db.query("DELETE FROM recipes WHERE recipe_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบสูตรอาหารที่ต้องการลบ" });
    }

    console.log("✅ ลบสูตรอาหารสำเร็จ:", result);
    res.json({ success: true, message: "ลบสูตรอาหารสำเร็จ" });
  } catch (error) {
    console.error("❌ Error deleting recipe:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบสูตรอาหาร" });
  }
});

// ✅ **อัปเดตสูตรอาหาร**
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { recipe_name, category_id, ingredients } = req.body;
  let imagePath = req.file ? `/uploads/recipes/${req.file.filename}` : null;

  try {
    // ดึงข้อมูลเก่า
    const [oldRecipe] = await db.query("SELECT image FROM recipes WHERE recipe_id = ?", [id]);

    if (!imagePath && oldRecipe.length > 0) {
      imagePath = oldRecipe[0].image;
    }

    // ✅ อัปเดตตาราง `recipes`
    await db.query(
      "UPDATE recipes SET recipe_name = ?, category_id = ?, image = ? WHERE recipe_id = ?",
      [recipe_name, category_id, imagePath, id]
    );

    // ✅ ลบวัตถุดิบเก่าทั้งหมด
    await db.query("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);

    // ✅ เพิ่มวัตถุดิบใหม่
    const ingredientList = JSON.parse(ingredients);
    for (const ing of ingredientList) {
      await db.query(
        "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (?, ?, ?)",
        [id, ing.ingredient_id, ing.quantity]
      );
    }

    res.json({ success: true, message: "อัปเดตสูตรอาหารสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error updating recipe:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
});

// ✅ **ดึงข้อมูลสูตรอาหารทั้งหมด**
router.get("/", async (req, res) => {
  try {
    const [recipes] = await db.query("SELECT * FROM recipes");
    res.json(recipes);
  } catch (error) {
    console.error("❌ Error fetching recipes:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดสูตรอาหาร" });
  }
});

// ✅ **ดึงข้อมูลสูตรอาหารตาม ID**
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [recipe] = await db.query("SELECT recipe_id, recipe_name, image, category_id FROM recipes WHERE recipe_id = ?", [id]);
    if (recipe.length === 0) {
      return res.status(404).json({ message: "ไม่พบสูตรอาหารนี้" });
    }

    const [ingredients] = await db.query(
      `SELECT ri.ingredient_id, 
              IFNULL(i.ingredient_name, 'ไม่พบชื่อ') AS ingredient_name, 
              ri.amount, 
              'กรัม' AS unit 
       FROM recipe_ingredients ri
       LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
       WHERE ri.recipe_id = ?`,
      [id]
    );

    console.log("📌 ดึงข้อมูลสูตรอาหาร:", recipe[0]);
    console.log("📌 วัตถุดิบที่ใช้:", ingredients);

    res.json({
      ...recipe[0],
      image: recipe[0].image ? `http://119.59.101.35:5000${recipe[0].image}` : null,
      ingredients
    });
  } catch (error) {
    console.error("❌ Error fetching recipe:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดสูตรอาหาร" });
  }
});

module.exports = router;
