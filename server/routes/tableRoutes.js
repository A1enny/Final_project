const express = require("express");
const db = require("../config/db");

module.exports = (io) => {
  const router = express.Router();

  // ✅ ดึงข้อมูลโต๊ะตาม ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [tables] = await db.query(
        "SELECT * FROM tables WHERE table_id = ?",
        [id]
      );

      if (tables.length === 0) {
        return res.status(404).json({ error: "ไม่พบโต๊ะนี้" });
      }

      res.json(tables[0]); // ✅ ส่งค่าโต๊ะตัวเดียวกลับไป
    } catch (error) {
      console.error("❌ Error fetching table by ID:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ✅ ดึงข้อมูลโต๊ะทั้งหมด
  router.get("/", async (req, res) => {
    try {
      const { search, status } = req.query;
      let query = "SELECT * FROM tables";
      let params = [];

      if (search || status) {
        query += " WHERE";
        const conditions = [];

        if (search) {
          conditions.push(" table_number LIKE ?");
          params.push(`%${search}%`);
        }

        if (status) {
          conditions.push(" status = ?");
          params.push(status);
        }

        query += conditions.join(" AND");
      }

      const [tables] = await db.query(query, params);
      res.json(tables);
    } catch (error) {
      console.error("❌ Error fetching tables:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ✅ Server-Sent Events (SSE) สำหรับอัปเดตสถานะโต๊ะแบบเรียลไทม์
  router.get("/updates", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendUpdate = async () => {
      try {
        const [tables] = await db.query("SELECT * FROM tables");
        res.write(`data: ${JSON.stringify(tables)}\n\n`);
      } catch (error) {
        console.error("❌ Error fetching table updates:", error);
      }
    };

    const interval = setInterval(sendUpdate, 5000);
    req.on("close", () => clearInterval(interval));
  });

  // ✅ เพิ่มโต๊ะใหม่
  router.post("/", async (req, res) => {
    const { table_number, seats } = req.body;

    // 🛠 ตรวจสอบค่า ถ้าไม่มีค่าให้ตั้งค่าเริ่มต้นเป็น "available"
    const status = "available";

    console.log("📌 รับข้อมูลจาก Frontend:", req.body);

    if (!table_number || !seats) {
      return res
        .status(400)
        .json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
    }

    try {
      await db.query(
        "INSERT INTO tables (table_number, seats, status) VALUES (?, ?, ?)",
        [table_number, seats, status] // ✅ กำหนดค่า default ให้ status
      );

      console.log("✅ เพิ่มโต๊ะสำเร็จ");
      res.json({ success: true, message: "เพิ่มโต๊ะสำเร็จ!" });
    } catch (error) {
      console.error("❌ เพิ่มโต๊ะผิดพลาด:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "เกิดข้อผิดพลาดในการเพิ่มโต๊ะ",
          error,
        });
    }
  });

  // ✅ อัปเดตสถานะโต๊ะ
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, session_id } = req.body;
      await db.query(
        "UPDATE tables SET status = ?, session_id = ? WHERE table_id = ?",
        [status, session_id, id]
      );
      res.json({ message: "อัปเดตสถานะโต๊ะสำเร็จ" });
    } catch (error) {
      console.error("❌ Error updating table:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ✅ ลบโต๊ะ
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.query("DELETE FROM tables WHERE table_id = ?", [id]);
      res.json({ message: "ลบโต๊ะสำเร็จ" });
    } catch (error) {
      console.error("❌ Error deleting table:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/api/tables/search", async (req, res) => {
    const { search, status } = req.query;
    let sql = "SELECT * FROM tables WHERE 1=1";
    const params = [];

    if (search) {
      sql += " AND table_number LIKE ?";
      params.push(`%${search}%`);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    try {
      const [rows] = await db.query(sql, params);
      res.json(rows);
    } catch (error) {
      console.error("❌ Error fetching tables:", error);
      res.status(500).json({ error: "Error fetching tables" });
    }
  });
  router.put("/:id/reset", async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(
        "UPDATE tables SET status = 'available' WHERE table_id = ?",
        [id]
      );
      res.json({ success: true, message: "โต๊ะถูกรีเซ็ตเป็น available แล้ว" });
    } catch (error) {
      console.error("❌ Error resetting table:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  router.get("/updates", async (req, res) => {
    try {
      const [tables] = await db.query("SELECT * FROM tables");
      res.json(tables);
    } catch (error) {
      console.error("❌ Error fetching table updates:", error);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดข้อมูลโต๊ะ" });
    }
  });
  
  return router;
};
