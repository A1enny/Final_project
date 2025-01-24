const express = require("express");
const router = express.Router();
const db = require("../config/db.js");

router.delete("/:id", async (req, res) => {
<<<<<<< HEAD
  const { id } = req.params;
  console.log(`🛑 กำลังลบสูตรอาหาร ID: ${id}`);

  try {
    // 🔹 ลบข้อมูลที่เกี่ยวข้องใน recipe_ingredients ก่อน
    await db.query("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);

    // 🔹 ลบข้อมูลที่เกี่ยวข้องใน menus ก่อน
    await db.query("DELETE FROM menus WHERE recipe_id = ?", [id]);

    // 🔹 ลบจาก recipes หลังจากลบ menus สำเร็จ
    const [result] = await db.query("DELETE FROM recipes WHERE recipe_id = ?", [
      id,
    ]);
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

router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, ingredients } = req.body;
  let imagePath = req.file ? `/uploads/recipes/${req.file.filename}` : null;

  try {
    // ดึงข้อมูลเก่าจากฐานข้อมูลก่อน
    const [oldRecipe] = await db.query(
      "SELECT image FROM recipes WHERE recipe_id = ?",
      [id]
    );

    // ถ้าผู้ใช้ไม่ได้อัปโหลดรูปใหม่ ให้ใช้รูปเก่า
    if (!imagePath && oldRecipe.length > 0) {
      imagePath = oldRecipe[0].image;
    }

    // อัปเดตข้อมูล
    await db.query(
      "UPDATE recipes SET name = ?, image = ?, ingredients = ? WHERE recipe_id = ?",
      [name, imagePath, ingredients, id]
    );

    res.json({ success: true, message: "อัพเดตสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error updating recipe:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [recipe] = await db.query(
      `
            SELECT * FROM recipes WHERE recipe_id = ?
        `,
      [id]
    );

    if (recipe.length === 0) {
      return res.status(404).json({ message: "ไม่พบสูตรอาหารนี้" });
    }

    const [ingredients] = await db.query(
      `
        SELECT ri.ingredient_id, COALESCE(i.ingredient_name, 'ไม่พบชื่อ') AS ingredient_name, 
        ri.amount, COALESCE(i.unit, 'กรัม') AS unit
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        WHERE ri.recipe_id = ?`,
      [id]
    );

    res.json({
      ...recipe[0],
      ingredients,
    });
  } catch (error) {
    console.error("❌ Error fetching recipe:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดสูตรอาหาร" });
  }
=======
    const { id } = req.params;
    console.log(`🛑 กำลังลบสูตรอาหาร ID: ${id}`);

    try {
        // 🔹 ลบข้อมูลที่เกี่ยวข้องใน recipe_ingredients ก่อน
        await db.query("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);

        // 🔹 ลบข้อมูลที่เกี่ยวข้องใน menus ก่อน
        await db.query("DELETE FROM menus WHERE recipe_id = ?", [id]);

        // 🔹 ลบจาก recipes หลังจากลบ menus สำเร็จ
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
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
});

// 🔹 ต้องใช้ module.exports
module.exports = router;
