const { Server } = require("socket.io");

let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: "http://localhost:5173", // ✅ อนุญาตให้ Frontend ใช้งาน
        methods: ["GET", "POST"],
      },
    });

    console.log("✅ Socket.IO initialized");

    io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // ✅ อัปเดตออเดอร์แบบเรียลไทม์
      socket.on("updateOrderStatus", (data) => {
        console.log("📢 Order status updated:", data);
        io.emit("orderStatusUpdated", data); // ✅ แจ้งเตือนทุก Client
      });

      // ✅ แจ้งเตือนเมื่อมีออเดอร์ใหม่
      socket.on("newOrder", (order) => {
        console.log("🛒 New Order Received:", order);
        io.emit("orderCreated", order); // ✅ กระจายออเดอร์ให้พนักงาน
      });

      // ✅ อัปเดตสถานะโต๊ะ
      socket.on("updateTableStatus", (table) => {
        console.log("🪑 Table status updated:", table);
        io.emit("tableStatusUpdated", table); // ✅ อัปเดตให้ทุก Client
      });

      socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("❌ Socket.io is not initialized!");
    }
    return io;
  },
};
