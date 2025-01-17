import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./Addrecipe.scss";

const unitOptions = [
  { value: "กรัม", label: "กรัม" },
  { value: "กิโลกรัม", label: "กิโลกรัม" },
  { value: "ฟอง", label: "ฟอง" },
  { value: "ใบ", label: "ใบ" },
];

const Addrecipe = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const title = id ? "แก้ไขสูตรอาหาร" : "สร้างสูตรอาหารใหม่";

  const [recipe, setRecipe] = useState({
    recipe_name: "",
    image: null,
    image_url: null,
  });

  const [ingredients, setIngredients] = useState([]);
  const [ingredient, setIngredient] = useState({
    ingredient_id: null,
    name: "",
    type: "",
    quantity: "",
    unit: "กรัม",
  });

  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // ✅ โหลดข้อมูลเมื่อแก้ไข
  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3002/api/recipes/${id}`
          );
          const recipeData = response.data;

          setRecipe({
            recipe_name: recipeData.name,
            image_url: recipeData.image.startsWith("http")
              ? recipeData.image
              : `http://localhost:3002/uploads/recipes/${recipeData.image}`,
            image: null,
          });

          setIngredients(
            recipeData.ingredients.map((ing) => ({
              ingredient_id: ing.ingredient_id,
              name: ing.name,
              category_id: ing.category_id,
              category_name: ing.category_name || "ไม่พบข้อมูล",
              quantity: ing.quantity,
              unit: ing.unit,
            }))
          );
        } catch (error) {
          console.error("Error fetching recipe:", error);
          Swal.fire("Error", "ไม่สามารถโหลดข้อมูลสูตรอาหารได้", "error");
        }
      };

      fetchRecipe();
    }
  }, [id]);

  // ✅ โหลดข้อมูลวัตถุดิบและหมวดหมู่
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ingredientsRes, categoriesRes] = await Promise.all([
          axios.get("http://localhost:3002/api/ingredients?limit=1000"),
          axios.get("http://localhost:3002/api/categories"),
        ]);

        setIngredientOptions(
          ingredientsRes.data.results.map((item) => ({
            value: item.ingredient_id,
            label: item.ingredient_name,
            category: item.category_name || "",
          }))
        );

        setCategoryOptions(
          categoriesRes.data.map((item) => ({
            value: item.category_id,
            label: item.category_name,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire(
          "Error",
          "ไม่สามารถดึงข้อมูลวัตถุดิบหรือหมวดหมู่ได้",
          "error"
        );
      }
    };

    fetchData();
  }, []);

  // ✅ เลือกวัตถุดิบ
  const handleIngredientSelect = (selectedOption) => {
    if (!selectedOption) return;

    setIngredient({
      ingredient_id: selectedOption.value,
      name: selectedOption.label,
      type: selectedOption.category_id,
      category_name: selectedOption.category || "ไม่พบข้อมูล",
      quantity: "",
      unit: "กรัม",
    });
  };

  // ✅ จัดการ Input Fields
  const handleIngredientsChange = (e) => {
    setIngredient((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ เพิ่มวัตถุดิบลงในรายการ
  const addIngredients = () => {
    if (!ingredient.ingredient_id || !ingredient.quantity || !ingredient.unit) {
      Swal.fire("Error", "กรุณากรอกข้อมูลวัตถุดิบให้ครบถ้วน", "error");
      return;
    }

    setIngredients((prev) => [...prev, ingredient]);
    setIngredient({
      ingredient_id: null,
      name: "",
      type: "",
      category_name: "",
      quantity: "",
      unit: "กรัม",
    });
  };

  // ✅ ส่งข้อมูลไป API
  const submitRecipe = async () => {
    if (!recipe.recipe_name || ingredients.length === 0) {
      Swal.fire("Error", "กรุณากรอกข้อมูลให้ครบถ้วน", "error");
      return;
    }

    const formData = new FormData();
    formData.append("recipe_name", recipe.recipe_name);
    if (recipe.image) formData.append("image", recipe.image);
    else if (recipe.image_url) formData.append("image_url", recipe.image_url);
    formData.append("ingredients", JSON.stringify(ingredients));

    try {
      if (id) {
        await axios.put(`http://localhost:3002/api/recipes/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("สำเร็จ", "อัปเดตสูตรอาหารเรียบร้อย", "success");
      } else {
        await axios.post("http://localhost:3002/api/recipes", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("สำเร็จ", "บันทึกสูตรอาหารเรียบร้อย", "success");
      }

      navigate("/recipe");
    } catch (error) {
      console.error("Error submitting recipe:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการบันทึกสูตรอาหาร", "error");
    }
  };

  return (
    <div className="add-recipe-container">
      <Navbar />
      <Sidebar />
      <div className="add-recipe-content">
        <h2>{title}</h2>
        <form className="create-form">
          <div className="form-section">
            <label>อัปโหลดรูปภาพ</label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setRecipe({
                    ...recipe,
                    image: file,
                    image_url: URL.createObjectURL(file),
                  });
                }
              }}
            />
            {recipe.image_url && (
              <img
                src={recipe.image_url}
                alt="Preview"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  marginTop: "10px",
                }}
              />
            )}
          </div>

          <div className="form-section">
            <label>ชื่อสูตรอาหาร</label>
            <input
              type="text"
              value={recipe.recipe_name}
              onChange={(e) =>
                setRecipe({ ...recipe, recipe_name: e.target.value })
              }
            />
          </div>

          {/* วัตถุดิบ */}
          <div className="form-section">
            <h3>วัตถุดิบ</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>ชื่อวัตถุดิบ</label>
                <Select
                  options={ingredientOptions}
                  value={
                    ingredientOptions.find(
                      (opt) => opt.value === ingredient.ingredient_id
                    ) || null
                  }
                  onChange={handleIngredientSelect}
                  placeholder="ค้นหาวัตถุดิบ..."
                />
              </div>
              <div className="form-group">
                <label>ปริมาณ</label>
                <input
                  type="number"
                  name="quantity"
                  value={ingredient.quantity}
                  onChange={handleIngredientsChange}
                />
              </div>
              <div className="form-group">
                <label>หน่วย</label>
                <Select
                  options={unitOptions}
                  value={
                    unitOptions.find((opt) => opt.value === ingredient.unit) ||
                    null
                  }
                  onChange={(selectedOption) =>
                    setIngredient((prev) => ({
                      ...prev,
                      unit: selectedOption.value,
                    }))
                  }
                  placeholder="เลือกหน่วย..."
                />
              </div>
              <button
                type="button"
                className="btn add-btn"
                onClick={addIngredients}
              >
                เพิ่มวัตถุดิบ
              </button>
            </div>
          </div>

          {/* แสดงรายการวัตถุดิบ */}
          <div className="ingredient-list">
            <h4>รายการวัตถุดิบที่เพิ่มแล้ว</h4>
            <table>
              <thead>
                <tr>
                  <th>ชื่อวัตถุดิบ</th>
                  <th>ประเภท</th>
                  <th>ปริมาณ</th>
                  <th>หน่วย</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing, index) => (
                  <tr key={index}>
                    <td>{ing.name.trim()}</td> {/* ✅ ใช้ trim() ตัดช่องว่าง */}
                    <td>{ing.category_name || "ไม่พบข้อมูล"}</td>{" "}
                    {/* ✅ แก้ category_name */}
                    <td>{ing.quantity}</td>
                    <td>{ing.unit || "กรัม"}</td>{" "}
                    {/* ✅ ป้องกันค่า unit เป็น undefined */}
                    <td>
                      <button
                        type="button"
                        className="btn delete-btn"
                        onClick={() =>
                          setIngredients(
                            ingredients.filter((_, i) => i !== index)
                          )
                        }
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ปุ่มยกเลิกและยืนยัน */}
          <div className="form-buttons">
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => navigate("/recipe")}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="btn save-btn"
              onClick={submitRecipe}
            >
              ยืนยัน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Addrecipe;
