const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const socket = require("./config/socket");
const path = require("path");
const db = require("./config/db");
const port = 3002;
const app = express();
const server = http.createServer(app);

// ✅ เปิดใช้งาน CORS ก่อน Middleware อื่น ๆ
app.use(cors({
    origin: 'http://localhost:5173', // หรือ URL ของ frontend
    credentials: true
}));

// ✅ Middleware อื่น ๆ
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ เปิดใช้งาน Socket.io
socket.init(server);
const io = socket.getIO();

// ✅ โหลด API Routes
const apiRoutes = require("./routes");
app.use("/api", apiRoutes);

// ✅ ตรวจสอบว่าเซิร์ฟเวอร์ทำงานได้
app.get("/", (req, res) => {
    res.send("Server is running...");
});

// ✅ เริ่มต้นเซิร์ฟเวอร์
server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
