const express = require("express");
const db = require("../config/db");

module.exports = (io) => {
  const router = express.Router();

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
    try {
      const { table_number, seats, status } = req.body;
      await db.query(
        "INSERT INTO tables (table_number, seats, status) VALUES (?, ?, ?)",
        [table_number, seats, status]
      );
      res.status(201).json({ message: "โต๊ะถูกเพิ่มสำเร็จ" });
    } catch (error) {
      console.error("❌ Error adding table:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ✅ อัปเดตสถานะโต๊ะ
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, session_id } = req.body;
      await db.query("UPDATE tables SET status = ?, session_id = ? WHERE table_id = ?", [status, session_id, id]);
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

  return router;
};
