const express = require("express");
const router = express.Router();
const db = require("../config/db.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/recipes/" });

// ✅ ลบสูตรอาหาร
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

// ✅ อัปเดตสูตรอาหาร
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, ingredients } = req.body;
  let imagePath = req.file ? `/uploads/recipes/${req.file.filename}` : null;

  try {
    const [oldRecipe] = await db.query("SELECT image FROM recipes WHERE recipe_id = ?", [id]);
    if (!imagePath && oldRecipe.length > 0 && oldRecipe[0].image) {
      imagePath = oldRecipe[0].image; // ใช้รูปเดิมหากไม่มีการอัปโหลดใหม่
    }    

    await db.query("UPDATE recipes SET recipe_name = ?, image = ? WHERE recipe_id = ?", [name, imagePath, id]);
    await db.query("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);
    
    const parsedIngredients = JSON.parse(ingredients);
    for (const ingredient of parsedIngredients) {
      await db.query("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (?, ?, ?)", [
        id,
        ingredient.ingredient_id,
        ingredient.quantity
      ]);
    }

    res.json({ success: true, message: "อัปเดตสูตรอาหารสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error updating recipe:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
});

// ✅ ดึงข้อมูลสูตรอาหาร
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [recipe] = await db.query("SELECT recipe_id, recipe_name, image FROM recipes WHERE recipe_id = ?", [id]);
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
      image: recipe[0].image.startsWith("http")
      ? recipe[0].image // ถ้าเป็น URL เต็ม ให้ใช้ค่าเดิม
      : `http://localhost:3002/uploads/recipes/${recipe[0].image}` // ถ้าไม่ใช่ URL เต็ม ให้เติม path    
    });
  } catch (error) {
    console.error("❌ Error fetching recipe:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดสูตรอาหาร" });
  }
});

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


module.exports = router;
