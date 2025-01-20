const express = require("express");
const userController = require("../controllers/userController");
console.log("✅ Loading authRoutes...");
const router = express.Router();
console.log("✅ Registered API: /api/auth/login"); 
router.post("/login", userController.login); // ✅ ต้องมี API นี้

module.exports = router;
