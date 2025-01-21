// const express = require("express");
// const userController = require("../controllers/userController");

// const router = express.Router();
// console.log("✅ Loading authRoutes...");

// router.post("/login", userController.login);

// console.log("✅ Registered API: /api/auth/login");
// module.exports = router;
const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();
console.log("✅ Loading authRoutes...");

router.post("/login", userController.login);

console.log("✅ Registered API: /api/auth/login");
module.exports = router;
