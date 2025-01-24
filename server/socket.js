const socketIo = require("socket.io");

let io;

module.exports = {
<<<<<<< HEAD
  init: (server) => {
    if (!io) {
      // ✅ Prevent initializing Socket.IO multiple times
      io = socketIo(server, {
        cors: {
          origin:" * ",
          methods: ["GET", "POST"],
        },
      });

      io.on("connection", (socket) => {
        console.log(`📡 Client connected: ${socket.id}`);

        socket.on("joinRoom", (table_id) => {
          socket.join(`table_${table_id}`);
          console.log(`👥 Client ${socket.id} joined table_${table_id}`);
        });

        socket.on("leaveRoom", (table_id) => {
          socket.leave(`table_${table_id}`);
          console.log(`👤 Client ${socket.id} left table_${table_id}`);
        });

        socket.on("new_order", (order) => {
          io.emit("update_orders", order);
          io.to(`table_${order.table_id}`).emit("new_order", order);
          console.log(
            `🛎️ New Order: Table ${order.table_id}, Menu ID: ${order.menu_id}`
          );
        });

        socket.on("order_updated", (order) => {
          io.emit("order_status_changed", order);
          io.to(`table_${order.table_id}`).emit("order_updated", order);
          console.log(
            `🔄 Order Updated: ${order.order_id}, Status: ${order.status}`
          );
        });

        socket.on("table_closed", (table) => {
          io.emit("table_closed", table);
          io.to(`table_${table.table_id}`).emit("table_closed", table);
          console.log(`🚪 Table Closed: ${table.table_id}`);
        });

        socket.on("update_orders", (order) => {
          console.log("Updated orders:", order);
        });

        socket.on("disconnect", () => {
          console.log(`❌ Client disconnected: ${socket.id}`);
        });
      });
    } else {
      console.log("⚠️ Socket.io is already initialized.");
    }

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("❌ Socket.io has not been initialized!");
    }
    return io;
  },
};
=======
    init: (server) => {
        if (!io) {  // ✅ ป้องกันการเรียก `init()` ซ้ำ
            io = socketIo(server, { 
                cors: {  
                    origin: ["http://localhost:5173", "http://192.168.1.44:5173"],
                    methods: ["GET", "POST"] // ✅ ระบุ Methods ที่อนุญาต
                } 
            });

            io.on("connection", (socket) => {
                console.log(`📡 Client connected: ${socket.id}`);

                socket.on("joinRoom", (table_id) => {
                    socket.join(`table_${table_id}`);
                    console.log(`👥 Client ${socket.id} joined table_${table_id}`);
                });

                socket.on("leaveRoom", (table_id) => {
                    socket.leave(`table_${table_id}`);
                    console.log(`👤 Client ${socket.id} left table_${table_id}`);
                });

                socket.on("new_order", (order) => {
                    io.emit("update_orders", order);
                    io.to(`table_${order.table_id}`).emit("new_order", order);
                    console.log(`🛎️ New Order: Table ${order.table_id}, Menu ID: ${order.menu_id}`);
                });

                socket.on("order_updated", (order) => {
                    io.emit("order_status_changed", order);
                    io.to(`table_${order.table_id}`).emit("order_updated", order);
                    console.log(`🔄 Order Updated: ${order.order_id}, Status: ${order.status}`);
                });

                socket.on("table_closed", (table) => {
                    io.emit("table_closed", table);
                    io.to(`table_${table.table_id}`).emit("table_closed", table);
                    console.log(`🚪 Table Closed: ${table.table_id}`);
                });

                socket.on("disconnect", () => {
                    console.log(`❌ Client disconnected: ${socket.id}`);
                });
            });
        } else {
            console.log("⚠️ Socket.io is already initialized.");
        }

        return io;
    },

    getIO: () => {
        if (!io) {
            throw new Error("❌ Socket.io has not been initialized!");
        }
        return io;
    }
};
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
