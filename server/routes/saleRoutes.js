const express = require("express");
const router = express.Router();
const db = require("../config/db"); // เชื่อม MySQL Database

// 📌 1. ดึงข้อมูลสรุปยอดขาย
router.get("/summary", async (req, res) => {
  try {
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(total_price), 0) AS total_sales,
        COALESCE(COUNT(DISTINCT table_id), 0) AS total_customers,
        COALESCE(COUNT(sale_id), 0) AS total_orders,
        COALESCE(AVG(total_price), 0) AS average_sales_per_order
      FROM sales;
    `;

    const [summary] = await db.query(summaryQuery);
    res.json(summary[0]);
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 2. ดึงข้อมูล Line Chart (ยอดขายรายเดือน)
router.get("/line", async (req, res) => {
  try {
    const lineQuery = `
      SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month, SUM(total_price) AS total_sales
      FROM sales
      GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
      ORDER BY month ASC;
    `;

    const [lineData] = await db.query(lineQuery);
    res.json(lineData);
  } catch (error) {
    console.error("Error fetching sales line chart data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 3. ดึงข้อมูล Pie Chart (สัดส่วนยอดขายของแต่ละหมวดหมู่)
router.get("/pie", async (req, res) => {
  try {
    const pieQuery = `
        SELECT c.category_name AS name, SUM(s.total_price) AS value
        FROM sales s
        JOIN menus m ON s.menu_id = m.menu_id
        JOIN categories c ON m.menu_category_id = c.category_id
        GROUP BY c.category_name;
      `;

    const [pieData] = await db.query(pieQuery);
    console.log("📊 Pie Chart Data:", pieData); // Debug
    res.json(pieData);
  } catch (error) {
    console.error("❌ Error fetching sales pie chart data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 5. ดึงข้อมูล Bar Chart (ยอดขายแยกตามช่องทาง)
router.get("/bar", async (req, res) => {
  try {
    const barQuery = `
        SELECT menu_id AS channel, SUM(total_price) AS sales
        FROM sales
        GROUP BY menu_id;
      `;

    const [barData] = await db.query(barQuery);
    res.json(barData);
  } catch (error) {
    console.error("Error fetching sales bar chart data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 6. ดึงสินค้าขายดี (Top Selling Products)
router.get("/products/top", async (req, res) => {
  try {
    const topProductsQuery = `
   SELECT r.recipe_name AS name, SUM(s.quantity) AS quantity_sold, SUM(s.total_price) AS total_sales
FROM sales s
JOIN menus m ON s.menu_id = m.menu_id
JOIN recipes r ON m.recipe_id = r.recipe_id
GROUP BY m.menu_id, r.recipe_name
ORDER BY total_sales DESC
LIMIT 5;
    `;

    const [topProducts] = await db.query(topProductsQuery);
    console.log("🔥 Top Selling Products:", topProducts); // Debug เช็คว่ามี menu_name หรือไม่
    res.json(topProducts);
  } catch (error) {
    console.error("❌ Error fetching top products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
