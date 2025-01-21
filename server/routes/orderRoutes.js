const express = require("express");
const router = express.Router();
const db = require("../config/db.js");

module.exports = (io) => {
  router.get("/", (req, res) => {
    res.send("Orders API is working!");
  });

  router.post("/", (req, res) => {
    const { table_id, session_id, menu_id, quantity, price } = req.body;
    const orderQuantity = quantity || 1;
    const totalPrice = price * orderQuantity;

    const sql =
      "INSERT INTO orders (table_id, menu_id, quantity, total_price, status, payment_status, session_id) VALUES (?, ?, ?, ?, 'pending', 'unpaid', ?)";

    db.query(
      sql,
      [table_id, menu_id, orderQuantity, totalPrice, session_id],
      (err, result) => {
        if (err) {
          console.error("❌ Error placing order:", err);
          return res
            .status(500)
            .json({ success: false, message: "เกิดข้อผิดพลาดในการสั่งอาหาร" });
        }

        // 📡 แจ้งเตือน WebSocket
        io.emit("new_order", { table_id, session_id });

        res.status(201).json({ success: true, message: "สั่งอาหารสำเร็จ!" });
      }
    );
  });
  
  // ✅ Server-Sent Events (SSE) สำหรับอัปเดตสถานะออเดอร์แบบเรียลไทม์
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

  
  // ✅ สั่งอาหาร
  router.post("/", (req, res) => {
    const { table_id, session_id, menu_id, quantity, price } = req.body;
    const orderQuantity = quantity || 1;
    const totalPrice = price * orderQuantity;

    const sql =
      "INSERT INTO orders (table_id, menu_id, quantity, total_price, status, payment_status, session_id) VALUES (?, ?, ?, ?, 'pending', 'unpaid', ?)";

    db.query(
      sql,
      [table_id, menu_id, orderQuantity, totalPrice, session_id],
      (err, result) => {
        if (err) {
          console.error("❌ Error placing order:", err);
          return res
            .status(500)
            .json({ success: false, message: "เกิดข้อผิดพลาดในการสั่งอาหาร" });
        }
        res.status(201).json({ success: true, message: "สั่งอาหารสำเร็จ!" });
      }
    );
  });

  router.post("/bulk", async (req, res) => {
    const { table_id, session_id, orders } = req.body;
    if (!orders || orders.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "ตะกร้าว่างเปล่า" });
    }

    const values = orders.map(({ menu_id, quantity, price }) => [
      table_id,
      menu_id,
      quantity,
      price * quantity,
      session_id,
    ]);

    try {
      await db.query(
        "INSERT INTO orders (table_id, menu_id, quantity, total_price, status, payment_status, session_id) VALUES ?",
        [values]
      );

      // 📡 แจ้งเตือน WebSocket
      io.emit("new_order", { table_id, session_id });

      res.status(201).json({ success: true, message: "สั่งอาหารสำเร็จ!" });
    } catch (error) {
      console.error("❌ Error placing bulk order:", error);
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
    }
  });

  return router;
};
