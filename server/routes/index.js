const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

fs.readdirSync(__dirname).forEach((file) => {
  if (file !== "index.js" && file.endsWith("Routes.js")) {
    const route = require(path.join(__dirname, file));
    if (route instanceof express.Router) {
      const routeName = file.replace("Routes.js", "").toLowerCase();
      router.use(`/${routeName}`, route);
      console.log(`✅ Registered API: /api/${routeName}`);
    }
  }
});

module.exports = router;
