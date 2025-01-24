const express = require("express");
const cors = require("cors");
const http = require("http");
const db = require("./config/db");
const socketIo = require("./socket.js");
const multer = require("multer");
const path = require("path");
<<<<<<< HEAD
=======
const http = require("http");
const db = require("./config/db.js");
const socket = require("./socket");
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a

const app = express();
const server = http.createServer(app);

<<<<<<< HEAD
// Initialize Socket.IO
const io = socketIo.init(server);

// ✅ เปิด CORS
app.use(cors({
  origin: "*",
=======
// ✅ เปิด CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.1.44:5173"],
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

<<<<<<< HEAD
// Middleware
app.use(express.json()); // Replaces bodyParser.json()
app.use(express.urlencoded({ extended: true })); // Replaces bodyParser.urlencoded()
app.use('/uploads/recipes', express.static('uploads/recipes'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ✅ ใช้ `io` ที่ถูกต้องกับ Routes
const orderRoutes = require("./routes/orderRoutes")(io);
const tableRoutes = require("./routes/tableRoutes")(io);
const userRoutes = require("./routes/userRoutes")(io);
const menuRoutes = require("./routes/menuRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const ingredientRoutes = require("./routes/ingredientRoutes");
const saleRoutes = require("./routes/saleRoutes");
app.use("/api/sales", saleRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menus", menuRoutes);
=======
// ✅ ใช้ `socket.init(server)` แค่ครั้งเดียว
socket.init(server);
const io = socket.getIO(); // ✅ ดึง `io` จาก `socket.js`

// Middleware
app.use(bodyParser.json());
app.use('/uploads/recipes', express.static('uploads/recipes'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ ใช้ `io` ที่ถูกต้องกับ Routes
const orderRoutes = require("./routes/orderRoutes")(io);
const tableRoutes = require("./routes/tableRoutes")(io);
const userRoutes = require("./routes/userRoutes");
const menuRoutes = require("./routes/menuRoutes");


app.use("/api/menus", menuRoutes);
app.use("/api/menu_category", menuRoutes);  // ✅ เพิ่ม API หมวดหมู่
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/users", userRoutes);

// ✅ ตั้งค่าอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: "./uploads/recipes",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Query Database Function
const queryDB = async (sql, params = []) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    console.error("❌ Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// ✅ SSE for real-time order updates
app.get("/api/orders/updates", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendUpdate = async () => {
    try {
      const [orders] = await db.query("SELECT * FROM orders WHERE status IN ('pending', 'preparing')");
      res.write(`data: ${JSON.stringify(orders)}\n\n`);
    } catch (error) {
      console.error("❌ Error fetching order updates:", error);
    }
  };

  const interval = setInterval(sendUpdate, 5000);
  req.on("close", () => clearInterval(interval));
});

// ✅ SSE for real-time table updates
app.get("/api/tables/updates", (req, res) => {
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

const QRCode = require("qrcode");

// ✅ API สำหรับสร้าง QR Code สำหรับแต่ละโต๊ะ
app.get("/api/qrcode/:table_id", async (req, res) => {
  try {
    const { table_id } = req.params;
    const orderUrl = `http://localhost:5173/order/${table_id}`; // ลิงก์ไปหน้าสั่งอาหาร

    // สร้าง QR Code เป็น Base64
    const qrCodeData = await QRCode.toDataURL(orderUrl);

    res.json({ table_id, qr_code: qrCodeData });
  } catch (error) {
    console.error("❌ Error generating QR Code:", error);
    res.status(500).json({ error: "Error generating QR Code" });
  }
});

app.put("/api/tables/:id/start", async (req, res) => {
  try {
    const { id } = req.params;
    const session_id = Date.now().toString();
    await queryDB("UPDATE tables SET status = 'in-use', session_id = ? WHERE table_id = ?", [session_id, id]);
    res.json({ message: "โต๊ะถูกเริ่มใช้งานแล้ว", session_id });
  } catch (error) {
    console.error("❌ Error starting table:", error);
    res.status(500).json({ error: "Error starting table" });
  }
});

app.put("/api/tables/:id/reset", async (req, res) => {
  try {
    const { id } = req.params;
    await queryDB("UPDATE tables SET status = 'available', session_id = NULL WHERE table_id = ?", [id]);
    res.json({ message: "โต๊ะกลับเป็น available แล้ว" });
  } catch (error) {
    console.error("❌ Error resetting table:", error);
    res.status(500).json({ error: "Error resetting table" });
  }
});


// ✅ ดึงวัตถุดิบทั้งหมด (พร้อมหมวดหมู่) + Pagination
app.get("/api/ingredients", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // ✅ ดึงข้อมูลวัตถุดิบ พร้อมหมวดหมู่
    const ingredients = await queryDB(
      `SELECT i.ingredient_id, i.ingredient_name, i.quantity, c.category_name 
       FROM ingredients i 
       LEFT JOIN categories c ON i.category_id = c.category_id 
       LIMIT ? OFFSET ?`, 
      [limit, offset]
    );

    // ✅ นับจำนวนวัตถุดิบทั้งหมด (สำหรับ pagination)
    const totalCount = await queryDB("SELECT COUNT(*) AS total FROM ingredients");

    res.json({
      results: ingredients, 
      totalPages: Math.ceil(totalCount[0].total / limit), 
      currentPage: page
    });

  } catch (error) {
    console.error("❌ Error fetching ingredients:", error);
    res.status(500).json({ error: "Error fetching ingredients" });
  }
});


// ✅ ดึงข้อมูลวัตถุดิบตาม ID
app.get("/api/ingredients/:id", async (req, res) => {
  try {
    const ingredient = await queryDB("SELECT * FROM ingredients WHERE ingredient_id = ?", [req.params.id]);
    ingredient.length > 0 ? res.json(ingredient[0]) : res.status(404).send("Ingredient not found");
  } catch (error) {
    res.status(500).send("Database error");
  }
});

// ✅ เพิ่มวัตถุดิบใหม่
app.post("/api/ingredients", async (req, res) => {
  try {
    const { ingredient_name, category_id, quantity } = req.body;
    const result = await queryDB("INSERT INTO ingredients (ingredient_name, category_id, quantity) VALUES (?, ?, ?)", [ingredient_name, category_id, quantity]);
    res.status(201).json({ message: "Ingredient added", id: result.insertId });
  } catch (error) {
    res.status(500).send("Database error");
  }
});

app.get("/api/ingredients", async (req, res) => {
  try {
    console.log("📢 Fetching ingredients...");
    const query = `
      SELECT i.ingredient_id, i.ingredient_name, i.quantity, c.category_name 
      FROM ingredients i
      LEFT JOIN categories c ON i.category_id = c.category_id
    `;
    const [results] = await db.query(query);
    console.log("✅ Ingredients fetched successfully:", results);
    res.json(results); // ส่งเป็น Array ตรงๆ
  } catch (error) {
    console.error("❌ Error fetching ingredients:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ" });
  }
});


// ✅ อัปเดตวัตถุดิบ
app.put("/api/ingredients/:id", async (req, res) => {
  try {
    const { ingredient_name, category_id, quantity } = req.body;
    await queryDB("UPDATE ingredients SET ingredient_name = ?, category_id = ?, quantity = ? WHERE ingredient_id = ?", [ingredient_name, category_id, quantity, req.params.id]);
    res.json({ message: "Ingredient updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating ingredient" });
  }
});

// Delete ingredient by ID
app.delete("/api/ingredients/:id", async (req, res) => {
  try {
    await queryDB("DELETE FROM ingredients WHERE ingredient_id = ?", [req.params.id]);
    res.json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    res.status(500).send("Database error");
  }
});

// ✅ อัปเดตวัตถุดิบ
app.put("/api/ingredients/:id", async (req, res) => {
  try {
    const { ingredient_name, category_id, quantity } = req.body;
    await queryDB("UPDATE ingredients SET ingredient_name = ?, category_id = ?, quantity = ? WHERE ingredient_id = ?", [ingredient_name, category_id, quantity, req.params.id]);
    res.json({ message: "Ingredient updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating ingredient" });
  }
});

app.get("/api/recipes", async (req, res) => {
  try {
    // ✅ ดึงข้อมูลสูตรอาหาร
    const recipes = await queryDB("SELECT * FROM recipes");

    if (!recipes.length) {
      return res.json({ results: [] }); // ✅ ส่ง array ว่างแทน 404
    }

    // ✅ ดึงวัตถุดิบที่เกี่ยวข้องกับแต่ละสูตรอาหาร
    const recipeWithIngredients = await Promise.all(
      recipes.map(async (recipe) => {
        const ingredients = await queryDB(
          `SELECT ri.ingredient_id, i.ingredient_name, c.category_name, ri.amount 
          FROM recipe_ingredients ri
          JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
          JOIN categories c ON i.category_id = c.category_id
          WHERE ri.recipe_id = ?`,
          [recipe.recipe_id]
        );

        return {
          id: recipe.recipe_id,
          name: recipe.recipe_name,
          image: recipe.image
            ? recipe.image.startsWith("http")
              ? recipe.image
              : `http://localhost:3002/uploads/recipes/${recipe.image}` // ✅ ตรวจสอบ URL ของรูปภาพ
            : null,
          ingredients: ingredients.length > 0 ? ingredients.map((ing) => ({
            id: ing.ingredient_id,
            name: ing.ingredient_name,
            type: ing.category_name,
            quantity: ing.amount,
          })) : [],
        };
      })
    );

    res.json({ results: recipeWithIngredients }); // ✅ ส่งข้อมูลที่ React ต้องการ
  } catch (error) {
    console.error("❌ Error fetching recipes:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสูตรอาหาร" });
  }
});

app.post("/api/recipes", upload.single("image"), async (req, res) => {
  try {
    const { recipe_name, ingredients } = req.body;
    if (!recipe_name || !ingredients) {
      return res.status(400).json({ error: "Incomplete data" });
    }

    // ✅ บันทึก URL ของรูปภาพแทนชื่อไฟล์
    const image = req.file
      ? `http://localhost:3002/uploads/recipes/${req.file.filename}`
      : null;

    const recipeResult = await queryDB(
      "INSERT INTO recipes (recipe_name, image) VALUES (?, ?)",
      [recipe_name, image]
    );
    const recipe_id = recipeResult.insertId;

    let ingredientList = [];
    try {
      ingredientList = JSON.parse(ingredients);
    } catch (error) {
      return res.status(400).json({ error: "Invalid ingredients format" });
    }

    const ingredientQueries = ingredientList.map((ing) =>
      queryDB(
        "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (?, ?, ?)",
        [recipe_id, ing.ingredient_id, ing.quantity]
      )
    );
    await Promise.all(ingredientQueries);

    res.json({ message: "Recipe added successfully", recipe_id });
  } catch (error) {
    console.error("❌ Error saving recipe:", error);
    res.status(500).json({ error: "Error saving recipe" });
  }
});

app.get("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recipes = await queryDB("SELECT * FROM recipes WHERE recipe_id = ?", [id]);

    if (!recipes.length) {
      return res.status(404).json({ message: "ไม่พบสูตรอาหาร" });
    }

    const recipe = recipes[0];

    // ✅ ดึงวัตถุดิบที่เกี่ยวข้องกับสูตรอาหารนี้
    const ingredients = await queryDB(
      `SELECT ri.ingredient_id, i.ingredient_name, c.category_name, ri.amount 
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
      LEFT JOIN categories c ON i.category_id = c.category_id
      WHERE ri.recipe_id = ?`,
      [recipe.recipe_id]
    );

    res.json({
      id: recipe.recipe_id,
      name: recipe.recipe_name,
      image: recipe.image.startsWith("http") ? recipe.image : `http://localhost:3002/uploads/recipes/${recipe.image}`,
      ingredients: ingredients.length > 0 ? ingredients.map((ing) => ({
        id: ing.ingredient_id,
        name: ing.ingredient_name,
        type: ing.category_name || "ไม่พบข้อมูล",
        quantity: ing.amount,
      })) : [],
    });
  } catch (error) {
    console.error("❌ Error fetching recipe:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสูตรอาหาร" });
  }
});



app.put("/api/recipes/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { recipe_name, ingredients } = req.body;

    if (!recipe_name || !ingredients) {
      return res.status(400).json({ error: "Incomplete data" });
    }

    let image = req.file ? `http://localhost:3002/uploads/recipes/${req.file.filename}` : req.body.image_url;

    // ✅ อัปเดตข้อมูลสูตรอาหาร
    await queryDB(
      "UPDATE recipes SET recipe_name = ?, image = ? WHERE recipe_id = ?",
      [recipe_name, image, id]
    );

    let ingredientList;
    try {
      ingredientList = JSON.parse(ingredients);
    } catch (error) {
      return res.status(400).json({ error: "Invalid ingredients format" });
    }

    if (ingredientList.length > 0) {
      // ✅ ลบเฉพาะวัตถุดิบที่มีอยู่แล้ว และเพิ่มใหม่เฉพาะที่ไม่มี
      const existingIngredients = await queryDB("SELECT ingredient_id FROM recipe_ingredients WHERE recipe_id = ?", [id]);
      const existingIds = existingIngredients.map(ing => ing.ingredient_id);

      const newIngredients = ingredientList.filter(ing => !existingIds.includes(ing.ingredient_id));
      const updatedIngredients = ingredientList.filter(ing => existingIds.includes(ing.ingredient_id));

      if (updatedIngredients.length > 0) {
        await Promise.all(updatedIngredients.map(ing =>
          queryDB("UPDATE recipe_ingredients SET amount = ? WHERE recipe_id = ? AND ingredient_id = ?", 
            [ing.quantity, id, ing.ingredient_id]
          )
        ));
      }

      if (newIngredients.length > 0) {
        await Promise.all(newIngredients.map(ing =>
          queryDB("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (?, ?, ?)", 
            [id, ing.ingredient_id, ing.quantity]
          )
        ));
      }
    }

    res.json({ message: "Recipe updated successfully" });
  } catch (error) {
    console.error("❌ Error updating recipe:", error);
    res.status(500).json({ error: "Error updating recipe" });
  }
});


app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await queryDB("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);
    await queryDB("DELETE FROM recipes WHERE recipe_id = ?", [id]);

    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting recipe:", error);
    res.status(500).json({ error: "Error deleting recipe" });
  }
});
// ✅ เพิ่ม API ดึงข้อมูลเมนู
app.get("/api/menus", async (req, res) => {
  try {
    const menus = await db.query(
      `SELECT m.menu_id, r.recipe_name AS menu_name, m.price, r.image AS menu_image 
       FROM menus m
       LEFT JOIN recipes r ON m.recipe_id = r.recipe_id`
    );

    res.json(menus[0]);  // ✅ ส่งข้อมูลกลับไปที่ frontend
  } catch (error) {
    console.error("❌ Error fetching menus:", error);
    res.status(500).json({ error: "Error fetching menus" });
  }
});

app.get("/api/menus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const menu = await queryDB(
      `SELECT m.menu_id, r.recipe_name AS menu_name, m.price, r.image AS menu_image 
       FROM menus m
       LEFT JOIN recipes r ON m.recipe_id = r.recipe_id
       WHERE m.menu_id = ?`,
      [id]
    );

    if (menu.length > 0) {
      res.json(menu[0]);
    } else {
      res.status(404).json({ error: "ไม่พบเมนูนี้" });
    }
  } catch (error) {
    console.error("❌ Error fetching menu:", error);
    res.status(500).json({ error: "Error fetching menu" });
  }
});


app.post("/api/menus", async (req, res) => {
  try {
    const { menu_name, recipe_id, price } = req.body;

    if (!menu_name || !recipe_id || !price) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const result = await queryDB(
      "INSERT INTO menus (menu_name, recipe_id, price) VALUES (?, ?, ?)",
      [menu_name, recipe_id, price]
    );

    res.status(201).json({ message: "เพิ่มเมนูสำเร็จ", menu_id: result.insertId });
  } catch (error) {
    console.error("❌ Error adding menu:", error);
    res.status(500).json({ error: "Error adding menu" });
  }
});

//table
// Express route for fetching tables
app.get("/api/tables", async (req, res) => {
  try {
    const tables = await queryDB("SELECT * FROM tables ORDER BY table_number ASC");
    res.json(tables);
  } catch (error) {
    console.error("❌ Error fetching tables:", error);
    res.status(500).json({ error: "Error fetching tables" });
  }
});


app.get("/api/tables/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tables = await queryDB("SELECT * FROM tables WHERE table_id = ?", [id]);

    if (!tables.length) {
      return res.status(404).json({ message: "ไม่พบโต๊ะที่ค้นหา" });
    }

    res.json(tables[0]);
  } catch (error) {
    console.error("❌ Error fetching table:", error);
    res.status(500).json({ error: "Error fetching table" });
  }
});

app.get("/api/tables/search", async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = "SELECT * FROM tables WHERE 1 = 1";
    let params = [];

    if (search) {
      query += " AND table_number LIKE ?";
      params.push(`%${search}%`);
    }

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    const tables = await queryDB(query, params);
    res.json(tables);
  } catch (error) {
    console.error("❌ Error searching tables:", error);
    res.status(500).json({ error: "Error searching tables" });
  }
});

app.post("/api/tables", async (req, res) => {
  try {
    const { table_number, seats, status = "available" } = req.body;

    if (!table_number || !seats) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const result = await queryDB(
      "INSERT INTO tables (table_number, seats, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
      [table_number, seats, status]
    );

    res.status(201).json({ message: "เพิ่มโต๊ะสำเร็จ", table_id: result.insertId });
  } catch (error) {
    console.error("❌ Error adding table:", error);
    res.status(500).json({ error: "Error adding table" });
  }
});

app.put("/api/tables/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, seats, status } = req.body;

    if (!table_number || !seats || !status) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    await queryDB(
      "UPDATE tables SET table_number = ?, seats = ?, status = ?, updated_at = NOW() WHERE table_id = ?",
      [table_number, seats, status, id]
    );

    res.json({ message: "อัปเดตข้อมูลโต๊ะสำเร็จ" });
  } catch (error) {
    console.error("❌ Error updating table:", error);
    res.status(500).json({ error: "Error updating table" });
  }
});

app.delete("/api/tables/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await queryDB("DELETE FROM tables WHERE table_id = ?", [id]);

    res.json({ message: "ลบโต๊ะสำเร็จ" });
  } catch (error) {
    console.error("❌ Error deleting table:", error);
    res.status(500).json({ error: "Error deleting table" });
  }
});

app.get("/api/tables/available", async (req, res) => {
  try {
    const tables = await queryDB("SELECT * FROM tables WHERE status = 'available'");
    res.json(tables);
  } catch (error) {
    console.error("❌ Error fetching available tables:", error);
    res.status(500).json({ error: "Error fetching available tables" });
  }
});


// ✅ เปิดให้มือถือเข้าถึง API
server.listen(3002, "0.0.0.0", () => {
  console.log("🚀 Server running on http://192.168.1.44:3002");
});
