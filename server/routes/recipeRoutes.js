const express = require("express");
const router = express.Router();
const db = require("../config/db.js");

router.delete("/:id", async (req, res) => {
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
});

// 🔹 ต้องใช้ module.exports
module.exports = router;
