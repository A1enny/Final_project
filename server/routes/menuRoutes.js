const express = require("express");
const router = express.Router();
const db = require("../config/db.js");

// ✅ API ดึงรายการเมนูทั้งหมด
router.get("/", async (req, res) => {
    try {
        const baseURL = "http://192.168.1.44:3002/"; // ✅ URL ของเซิร์ฟเวอร์
        const defaultImage = `${baseURL}default-image.png`; // ✅ รูปเริ่มต้นถ้าไม่มีภาพ

        const [menus] = await db.query(`
            SELECT 
                m.menu_id AS id, 
                r.recipe_name AS name,   -- ✅ ใช้ recipe_name แทน menu_name
                CAST(m.price AS DECIMAL(10,2)) + 0 AS price, 
                IFNULL(CONCAT(?, r.image), ?) AS image
            FROM menus m
            JOIN recipes r ON m.recipe_id = r.recipe_id
        `, [baseURL, defaultImage]);

        console.log("📡 เมนูที่ส่งไปยัง Frontend:", menus);
        res.json(menus);
    } catch (error) {
        console.error("❌ Error fetching menu:", error);
        res.status(500).json({ error: "Error fetching menu" });
    }
});

module.exports = router;
