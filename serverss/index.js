// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const socket = require("./config/socket");
// const path = require("path");
// const db = require("./config/db");
// const http = require("http"); // ✅ เพิ่มการเรียกใช้ http module

// const app = express();
// const port = process.env.PORT || 3002; // ✅ กำหนดค่า port

// // ✅ เปิดใช้งาน CORS ก่อน Middleware อื่น ๆ
// app.use(cors({
//     origin: ["http://localhost:3000", "http://myapp.local"], // ใส่ URL ใหม่ที่คุณใช้
//     credentials: true
// }));

// // ✅ Middleware อื่น ๆ
// app.use(bodyParser.json());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ✅ สร้างเซิร์ฟเวอร์ด้วย http
// const server = http.createServer(app);

// // ✅ เปิดใช้งาน Socket.io
// socket.init(server);
// const io = socket.getIO();

// // ✅ โหลด API Routes
// const apiRoutes = require("./routes");
// console.log("📌 Checking Loaded Routes:", apiRoutes);
// app.use("/api", apiRoutes);

// // ✅ ตรวจสอบว่าเซิร์ฟเวอร์ทำงานได้
// app.get("/", (req, res) => {
//     res.send("Server is running...");
// });

// // ✅ เริ่มต้นเซิร์ฟเวอร์
// server.listen(port, () => {
//     console.log(`🚀 Server running on http://localhost:${port}`);
// });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const socket = require("./config/socket");
const path = require("path");
const db = require("./config/firebaseConfig"); // ✅ ใช้ Firebase
const http = require("http");

const app = express();
const port = process.env.PORT || 3002;

app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
socket.init(server);

// ✅ โหลด API Routes
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");

app.use("/api/auth", authRoutes);
app.use("/api", menuRoutes);

// ✅ ตรวจสอบว่าเซิร์ฟเวอร์ทำงานได้
app.get("/", (req, res) => {
    res.send("🔥 Server is running with Firebase...");
});

// ✅ เริ่มต้นเซิร์ฟเวอร์
server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
