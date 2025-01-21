const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// ✅ อ่านไฟล์ทั้งหมดในโฟลเดอร์ปัจจุบัน (routes)
fs.readdirSync(__dirname).forEach((file) => {
  const fullPath = path.join(__dirname, file);

  // ✅ ตรวจสอบว่าเป็นไฟล์ .js และไม่ใช่ index.js
  if (file !== "index.js" && file.endsWith(".js") && fs.statSync(fullPath).isFile()) {
    try {
      const route = require(fullPath);

      // ✅ ตรวจสอบว่า module ที่โหลดเป็น Router
      if (route instanceof express.Router) {
        const routeName = file.replace("Routes.js", "").toLowerCase();
        router.use(`/${routeName}`, route);
        console.log(`✅ Registered API: /api/${routeName}`);
      } else {
        console.warn(`⚠️ Warning: ${file} does not export an Express Router`);
      }
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error);
    }
  }
});

module.exports = router;
