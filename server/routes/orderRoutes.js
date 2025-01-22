const express = require("express");
const router = express.Router();
const db = require("../config/db.js");

module.exports = (io) => {
// ✅ ดึงรายการออร์เดอร์ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const { table_id } = req.query;
    let query = `
      SELECT 
        r.recipe_name,  
        SUM(o.quantity) AS total_quantity,  -- ✅ รวมจำนวน
        SUM(o.total_price) AS total_price  -- ✅ รวมราคาทั้งหมด
      FROM orders o
      LEFT JOIN menus m ON o.menu_id = m.menu_id
      LEFT JOIN recipes r ON m.recipe_id = r.recipe_id
      WHERE o.table_id = ?
      GROUP BY r.recipe_name  -- ✅ รวมรายการที่มีชื่อเมนูซ้ำกัน
      ORDER BY MAX(o.created_at) DESC
    `;

    const [orders] = await db.query(query, [table_id]);
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ" });
  }
});


  // ✅ สั่งอาหารแบบรายการเดียว
  router.post("/", async (req, res) => {
    const { table_id, session_id, menu_id, menu_name, quantity, price } = req.body;
    const orderQuantity = quantity || 1;
    const totalPrice = price * orderQuantity;

    try {
      await db.query(
        "INSERT INTO orders (table_id, menu_id, quantity, status, total_price, payment_status, session_id) VALUES (?, ?, ?, 'pending', ?, 'unpaid', ?)",
        [table_id, menu_id, orderQuantity, totalPrice, session_id]
      );

      // 📡 แจ้งเตือน WebSocket
      io.emit("new_order", { table_id, menu_id, quantity: orderQuantity });

      res.status(201).json({ success: true, message: "สั่งอาหารสำเร็จ!" });
    } catch (error) {
      console.error("❌ Error placing order:", error);
      res
        .status(500)
        .json({ success: false, message: "เกิดข้อผิดพลาดในการสั่งอาหาร" });
    }
  });

  // ✅ สั่งอาหารแบบหลายรายการ (Bulk Order)
  router.post("/bulk", async (req, res) => {
    const { table_id, session_id, orders } = req.body;

    if (!orders || orders.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "ตะกร้าว่างเปล่า" });
    }

    let connection;
    try {
      // ✅ ใช้ getConnection() เพื่อใช้ Transaction
      connection = await db.getConnection();
      await connection.beginTransaction();

      for (const order of orders) {
        const { menu_id, quantity, price } = order;

        // 1️⃣ บันทึกคำสั่งซื้อ
        await connection.query(
          "INSERT INTO orders (table_id, menu_id, quantity, status, total_price, payment_status, session_id) VALUES (?, ?, ?, 'pending', ?, 'unpaid', ?)",
          [table_id, menu_id, quantity, price * quantity, session_id]
        );

        // 2️⃣ ค้นหาวัตถุดิบที่ใช้สำหรับเมนูนี้
        const [ingredients] = await connection.query(
          "SELECT ingredient_id, amount FROM recipe_ingredients WHERE recipe_id = ?",
          [menu_id]
        );

        // 3️⃣ หักจำนวนวัตถุดิบจากคลัง
        for (const ingredient of ingredients) {
          await connection.query(
            "UPDATE ingredients SET quantity = GREATEST(quantity - ?, 0) WHERE ingredient_id = ?",
            [ingredient.amount * quantity, ingredient.ingredient_id]
          );
        }
      }

      // ✅ Commit Transaction
      await connection.commit();

      // 📡 แจ้งเตือน WebSocket
      io.emit("new_order", { table_id, session_id, orders });

      res.status(201).json({ success: true, message: "สั่งอาหารสำเร็จ!" });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("❌ Error processing bulk order:", error);
      res
        .status(500)
        .json({ success: false, message: "เกิดข้อผิดพลาดในการสั่งอาหาร" });
    } finally {
      if (connection) connection.release(); // ปิดการเชื่อมต่อ
    }
  });

  // ✅ อัปเดตสถานะออเดอร์แบบเรียลไทม์ (Server-Sent Events - SSE)
  router.get("/updates", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendUpdate = async () => {
      try {
        const [orders] = await db.query(
          "SELECT * FROM orders WHERE status IN ('pending', 'preparing')"
        );
        res.write(`data: ${JSON.stringify(orders)}\n\n`);
      } catch (error) {
        console.error("❌ Error fetching order updates:", error);
      }
    };

    const interval = setInterval(sendUpdate, 5000);
    req.on("close", () => clearInterval(interval));
  });

  // ✅ ดึงออร์เดอร์ของโต๊ะที่กำหนด
  router.get("/", async (req, res) => {
    try {
      const { table_id } = req.query;
      let query = `
        SELECT 
          o.order_id, 
          o.table_id, 
          o.quantity, 
          o.total_price, 
          o.status, 
          r.recipe_name  -- ✅ เปลี่ยนจาก menu_name เป็น recipe_name
        FROM orders o
        JOIN menus m ON o.menu_id = m.menu_id
        JOIN recipes r ON m.recipe_id = r.recipe_id  -- ✅ JOIN recipes
      `;
  
      const params = [];
      if (table_id) {
        query += " WHERE o.table_id = ?";
        params.push(table_id);
      }
  
      const [orders] = await db.query(query, params);
      res.json(orders);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลออร์เดอร์" });
    }
  });

  router.put("/update-status/:tableId", async (req, res) => {
    const { tableId } = req.params;
    
    try {
      await db.query(
        "UPDATE orders SET status = 'paid' WHERE table_id = ? AND status = 'pending'",
        [tableId]
      );
      res.json({ success: true, message: "อัปเดตสถานะเป็น paid แล้ว" });
    } catch (error) {
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error });
    }
  });
  
  router.put("/update-payment", async (req, res) => {
    const { table_id, payment_status } = req.body;
  
    if (!table_id) {
      return res.status(400).json({ success: false, message: "ต้องระบุ table_id" });
    }
  
    try {
      await db.query(
        "UPDATE orders SET payment_status = ? WHERE table_id = ?",
        [payment_status, table_id]
      );
      res.json({ success: true, message: "อัปเดตการชำระเงินสำเร็จ!" });
    } catch (error) {
      console.error("❌ Error updating payment:", error);
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error });
    }
  });
  
  return router;
};
