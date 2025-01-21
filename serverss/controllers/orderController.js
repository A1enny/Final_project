const db = require("../config/db");
const socket = require("../config/socket");

exports.createOrder = async (req, res) => {
  try {
    const { table_id, menu_id, quantity } = req.body;
    const [result] = await db.query(
      "INSERT INTO orders (table_id, menu_id, quantity, status, payment_status) VALUES (?, ?, ?, 'pending', 'unpaid')",
      [table_id, menu_id, quantity]
    );

    const newOrder = { order_id: result.insertId, table_id, menu_id, quantity, status: "pending", payment_status: "unpaid" };

    // ✅ ส่งออเดอร์ใหม่ไปยังพนักงาน (Real-Time)
    socket.getIO().emit("newOrder", newOrder);

    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
    try {
      const { order_id } = req.params;
      const { status } = req.body;
  
      await db.query("UPDATE orders SET status = ? WHERE order_id = ?", [status, order_id]);
  
      // ✅ ส่งข้อมูลการอัปเดตแบบเรียลไทม์
      socket.getIO().emit("orderStatusUpdated", { order_id, status });
  
      res.json({ message: "Order status updated!", order_id, status });
    } catch (error) {
      res.status(500).json({ message: "Error updating order status", error: error.message });
    }
  };
  