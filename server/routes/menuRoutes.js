const express = require("express");
const router = express.Router();
const db = require("../config/db.js");

// ✅ API ดึงข้อมูลหมวดหมู่
router.get("/category", async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM menu_category");
        res.json(categories);
    } catch (error) {
        console.error("❌ Error fetching menu categories:", error);
        res.status(500).json({ error: "ไม่สามารถดึงข้อมูลหมวดหมู่อาหารได้" });
    }
});

// ✅ API ดึงข้อมูลเมนูทั้งหมด พร้อมหมวดหมู่และรูปภาพ
router.get("/", async (req, res) => {
    try {
        const baseURL = "http://localhost:3002/";
        const defaultImage = `${baseURL}default-image.png`;

        const [menus] = await db.query(`
            SELECT 
                m.menu_id AS id, 
                r.recipe_name AS name,
                CAST(m.price AS DECIMAL(10,2)) + 0 AS price, 
                IFNULL(r.image, ?) AS image,
                mc.category_id,  
                mc.category_name 
            FROM menus m
            LEFT JOIN recipes r ON m.recipe_id = r.recipe_id
            LEFT JOIN menu_category mc ON m.menu_category_id = mc.category_id
        `, [defaultImage]);

        res.json(menus);
    } catch (error) {
        console.error("❌ Error fetching menu:", error);
        res.status(500).json({ error: "Error fetching menu" });
    }
});


router.post("/", async (req, res) => {
    const { recipe_id, menu_category_id, price } = req.body;

    if (!recipe_id || !menu_category_id || !price) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    try {
        const result = await db.query(
            "INSERT INTO menus (recipe_id, menu_category_id, price) VALUES (?, ?, ?)",
            [recipe_id, menu_category_id, price]
        );
        res.status(201).json({ message: "เพิ่มเมนูสำเร็จ", menu_id: result.insertId });
    } catch (error) {
        console.error("❌ Error adding menu:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มเมนู" });
    }
});

module.exports = router;
