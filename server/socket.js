const socketIo = require("socket.io");

let io;

module.exports = {
    init: (server) => {
        io = socketIo(server, { cors: { origin: "*" } });

        io.on("connection", (socket) => {
            console.log(`📡 Client connected: ${socket.id}`);

            // 🔹 เข้าร่วมโต๊ะ (เมื่อสแกน QR Code)
            socket.on("joinRoom", (table_id) => {
                socket.join(`table_${table_id}`);
                console.log(`👥 Client ${socket.id} joined table_${table_id}`);
            });

            // 🔹 ออกจากโต๊ะ (เมื่อปิดหน้าเว็บ)
            socket.on("leaveRoom", (table_id) => {
                socket.leave(`table_${table_id}`);
                console.log(`👤 Client ${socket.id} left table_${table_id}`);
            });

            // 🔹 แจ้งเตือนออเดอร์ใหม่ไปยัง Admin และโต๊ะที่เกี่ยวข้อง
            socket.on("new_order", (order) => {
                io.emit("update_orders", order); // แจ้งทุกคนที่เกี่ยวข้อง
                io.to(`table_${order.table_id}`).emit("new_order", order); // แจ้งเฉพาะโต๊ะที่เกี่ยวข้อง
                console.log(`🛎️ New Order: Table ${order.table_id}, Menu ID: ${order.menu_id}`);
            });

            // 🔹 แจ้งเตือนเมื่ออัปเดตสถานะออเดอร์
            socket.on("order_updated", (order) => {
                io.emit("order_status_changed", order);
                io.to(`table_${order.table_id}`).emit("order_updated", order);
                console.log(`🔄 Order Updated: ${order.order_id}, Status: ${order.status}`);
            });

            // 🔹 แจ้งเตือนเมื่อโต๊ะถูกปิด
            socket.on("table_closed", (table) => {
                io.emit("table_closed", table);
                io.to(`table_${table.table_id}`).emit("table_closed", table);
                console.log(`🚪 Table Closed: ${table.table_id}`);
            });

            // 🔹 ลูกค้าหรือ Admin ออกจากระบบ
            socket.on("disconnect", () => {
                console.log(`❌ Client disconnected: ${socket.id}`);
            });
        });

        return io;
    },

    getIO: () => {
        if (!io) {
            throw new Error("❌ Socket.io has not been initialized!");
        }
        return io;
    }
};
