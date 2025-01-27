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
                r.recipe_name AS itemName,
                SUM(o.quantity) AS quantity,  -- รวมจำนวนที่สั่ง
                SUM(o.total_price) AS price   -- รวมราคารวม
            FROM orders o
            JOIN menus m ON o.menu_id = m.menu_id
            JOIN recipes r ON m.recipe_id = r.recipe_id
            WHERE o.table_id = ?
            GROUP BY r.recipe_name  -- จัดกลุ่มตามชื่อเมนู
        `;

      const [orders] = await db.query(query, [table_id]);
      res.json(orders);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลออร์เดอร์" });
    }
  });

  // ✅ สั่งอาหารแบบรายการเดียว
  router.post("/", async (req, res) => {
    const { table_id, session_id, menu_id, menu_name, quantity, price } =
      req.body;
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

    if (!orders || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "❌ ไม่มีออร์เดอร์ที่ต้องชำระเงิน",
      });
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
      res
        .status(500)
        .json({ success: false, message: "เกิดข้อผิดพลาด", error });
    }
  });

  router.put("/confirm-payment", async (req, res) => {
    const { table_id } = req.body;

    if (!table_id) {
        return res.status(400).json({ success: false, message: "ต้องระบุ table_id" });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // ✅ 1. ดึงรายการออร์เดอร์ของโต๊ะนี้
        const [orders] = await connection.query(
            `SELECT o.menu_id, o.quantity, o.total_price 
             FROM orders o 
             WHERE o.table_id = ? AND o.payment_status = 'unpaid'`,
            [table_id]
        );

        if (orders.length === 0) {
            throw new Error("ไม่มีออร์เดอร์ที่ต้องชำระเงิน");
        }

        // ✅ 2. หักจำนวนวัตถุดิบตามสูตรอาหาร (ใช้หน่วยเป็น "กรัม" เท่านั้น)
        for (const order of orders) {
            const [ingredientResults] = await connection.query(
                `SELECT ri.ingredient_id, ri.amount, i.quantity AS current_quantity
                 FROM recipe_ingredients ri
                 JOIN menus m ON ri.recipe_id = m.recipe_id
                 JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
                 WHERE m.menu_id = ?`,
                [order.menu_id]
            );

            if (!ingredientResults || ingredientResults.length === 0) {
                console.warn(`⚠️ ไม่มีวัตถุดิบที่ต้องลดสำหรับเมนู ${order.menu_id}`);
                continue;
            }

            for (const ingredient of ingredientResults) {
                let currentQuantity = parseFloat(ingredient.current_quantity); // ✅ ใช้ค่าตรงๆ ในหน่วย "กรัม"
                let amountToDeduct = parseFloat(ingredient.amount) * order.quantity; // ✅ ใช้ค่าตรงๆ

                console.log(`🔹 ก่อนลด ingredient_id=${ingredient.ingredient_id}, คงเหลือ=${currentQuantity} g`);

          if (currentQuantity < amountToDeduct) {
            console.error(
              `⚠️ วัตถุดิบไม่พอ ingredient_id=${ingredient.ingredient_id}, ต้องการ=${amountToDeduct} g, คงเหลือ=${currentQuantity} g`
            );
            throw new Error(
              `วัตถุดิบไม่พอ: ingredient_id=${ingredient.ingredient_id}`
            );
          }

          console.log(
            `🔹 ลดวัตถุดิบ: ingredient_id = ${ingredient.ingredient_id}, ลด = ${amountToDeduct} g`
          );

          // ✅ **อัปเดตจำนวนวัตถุดิบในหน่วยกิโลกรัม**
          let newQuantity = (currentQuantity - amountToDeduct) / 1000; // แปลงกลับเป็น kg

          await connection.query(
            "UPDATE ingredients SET quantity = ? WHERE ingredient_id = ?",
            [newQuantity, ingredient.ingredient_id]
          );

                // ✅ ดึงค่าล่าสุดของวัตถุดิบหลังจากอัปเดต
                const [updatedIngredient] = await connection.query(
                    "SELECT quantity FROM ingredients WHERE ingredient_id = ?",
                    [ingredient.ingredient_id]
                );

                console.log(`✅ หลังลด ingredient_id=${ingredient.ingredient_id}, คงเหลือ=${updatedIngredient[0].quantity} g`);
            }
        }

        // ✅ 3. บันทึกยอดขาย
        for (const order of orders) {
            await connection.query(
                "INSERT INTO sales (table_id, menu_id, quantity, total_price, sale_date) VALUES (?, ?, ?, ?, NOW())",
                [table_id, order.menu_id, order.quantity, order.total_price]
            );
        }

        // ✅ 4. ลบออร์เดอร์ที่ชำระเงินแล้วออกจาก `orders`
        await connection.query(
            "DELETE FROM orders WHERE table_id = ? AND payment_status = 'unpaid'",
            [table_id]
        );

        // ✅ 5. รีเซ็ตสถานะโต๊ะเป็น `available`
        await connection.query(
            "UPDATE tables SET status = 'available' WHERE table_id = ?",
            [table_id]
        );

        await connection.commit();

        io.emit("order_paid", { table_id });

        res.json({
            success: true,
            message: "ชำระเงินสำเร็จ, อัปเดตสต็อก และรีเซ็ตโต๊ะ",
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("❌ Error confirming payment:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาด",
            error: error.message,
        });
    } finally {
      if (connection) connection.release();
    }
});

  return router;
};
