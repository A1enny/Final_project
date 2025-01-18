const express = require("express");
const db = require("../config/db.js");

module.exports = (io) => {
    const router = express.Router();

    // 📌 ฟังก์ชันตรวจสอบข้อมูลออเดอร์ก่อนบันทึก
    const validateOrder = (req) => {
        const { table_id, session_id, menu_id, quantity, total_price } = req.body;
        if (!table_id || !session_id || !menu_id || !quantity || !total_price) {
            return "ข้อมูลไม่ครบถ้วน";
        }
        if (quantity <= 0 || total_price <= 0) {
            return "จำนวนและราคารวมต้องมากกว่า 0";
        }
        return null;
    };

    // 🔹 สั่งอาหาร (ลูกค้า)
    router.post("/", async (req, res) => {
        const validationError = validateOrder(req);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const { table_id, session_id, menu_id, quantity, total_price } = req.body;

        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            // 🔍 ตรวจสอบว่า `session_id` ถูกต้องหรือไม่
            const [table] = await connection.query(
                "SELECT session_id FROM maw_db_tables WHERE table_id = ?",
                [table_id]
            );
            if (!table.length || table[0].session_id !== session_id) {
                return res.status(400).json({ message: "QR Code หมดอายุ หรือ โต๊ะถูกปิดแล้ว" });
            }

            // 🔍 ตรวจสอบว่า `menu_id` มีอยู่จริง
            const [menu] = await connection.query(
                "SELECT menu_name FROM maw_db_menus WHERE menu_id = ?",
                [menu_id]
            );
            if (!menu.length) {
                return res.status(404).json({ message: "ไม่พบเมนูที่เลือก" });
            }

            // ✅ บันทึกออเดอร์ลงฐานข้อมูล
            const [result] = await connection.query(
                "INSERT INTO maw_db_orders (table_id, menu_id, quantity, total_price, status, payment_status, session_id) VALUES (?, ?, ?, ?, 'pending', 'unpaid', ?)",
                [table_id, menu_id, quantity, total_price, session_id]
            );

            const newOrder = {
                order_id: result.insertId,
                table_id,
                menu_id,
                menu_name: menu[0].menu_name,
                quantity,
                total_price,
                status: "pending",
                payment_status: "unpaid",
            };

            await connection.commit();

            // 🔥 แจ้งเตือนเฉพาะ Admin และโต๊ะที่เกี่ยวข้องผ่าน Socket.io
            io.emit("update_orders", newOrder);
            io.to(`table_${table_id}`).emit("new_order", newOrder);

            res.status(201).json({ message: "สั่งอาหารสำเร็จ", order: newOrder });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error("❌ Error placing order:", error);
            res.status(500).json({ message: "เกิดข้อผิดพลาดในการสั่งอาหาร" });
        } finally {
            if (connection) connection.release();
        }
    });

    // 🔹 อัปเดตสถานะออเดอร์ (Admin / ครัว)
    router.put("/updateStatus/:order_id", async (req, res) => {
        const { order_id } = req.params;
        const { status } = req.body;
        const validStatuses = ["pending", "preparing", "served", "completed"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
        }

        let connection;
        try {
            connection = await db.getConnection();
            
            // ตรวจสอบว่าออเดอร์มีอยู่จริง
            const [order] = await connection.query(
                "SELECT table_id FROM maw_db_orders WHERE order_id = ?",
                [order_id]
            );
            if (!order.length) {
                return res.status(404).json({ message: "ไม่พบออเดอร์" });
            }

            await connection.query(
                "UPDATE maw_db_orders SET status = ? WHERE order_id = ?",
                [status, order_id]
            );

            // 🔥 แจ้งเตือนอัปเดตสถานะไปยังลูกค้าเฉพาะโต๊ะที่เกี่ยวข้อง
            io.to(`table_${order[0].table_id}`).emit("order_updated", { order_id, status });

            res.json({ success: true, message: "อัปเดตสถานะออเดอร์สำเร็จ" });
        } catch (error) {
            console.error("❌ Error updating order status:", error);
            res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
        } finally {
            if (connection) connection.release();
        }
    });

    // 🔹 ปิดโต๊ะ (หลังจากจ่ายเงิน)
    router.post("/closeTable", async (req, res) => {
        const { table_id } = req.body;

        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            // ตรวจสอบว่ามีออเดอร์ค้างอยู่หรือไม่
            const [pendingOrders] = await connection.query(
                "SELECT COUNT(*) AS count FROM maw_db_orders WHERE table_id = ? AND status IN ('pending', 'preparing')",
                [table_id]
            );

            if (pendingOrders[0].count > 0) {
                return res.status(400).json({ message: "ไม่สามารถปิดโต๊ะได้ ยังมีออเดอร์ที่กำลังดำเนินการอยู่" });
            }

            await connection.query(
                "UPDATE maw_db_tables SET session_id = NULL, status = 'available' WHERE table_id = ?",
                [table_id]
            );

            await connection.query(
                "UPDATE maw_db_orders SET status = 'completed' WHERE table_id = ?",
                [table_id]
            );

            await connection.commit();

            // 🔥 แจ้งเตือนว่าโต๊ะถูกปิด
            io.to(`table_${table_id}`).emit("table_closed", { table_id });

            res.json({ success: true, message: "โต๊ะถูกปิดแล้ว" });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error("❌ Error closing table:", error);
            res.status(500).json({ message: "เกิดข้อผิดพลาดในการปิดโต๊ะ" });
        } finally {
            if (connection) connection.release();
        }
    });

    return router;
};
