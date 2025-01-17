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
    category_id: null,
    image: null,
    image_url: null,
  });

  const [ingredients, setIngredients] = useState([]);
  const [ingredient, setIngredient] = useState({
    ingredient_id: null,
    name: "",
    quantity: "",
    unit: "กรัม",
  });

  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // ✅ โหลดหมวดหมู่อาหาร (menu_category) และวัตถุดิบ (ingredients) ครั้งเดียว
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ingredientsRes, categoriesRes] = await Promise.all([
          axios.get("http://localhost:3002/api/ingredients?limit=1000"),
          axios.get("http://localhost:3002/api/menus/category"),
        ]);

        setIngredientOptions(
          ingredientsRes.data.results.map((item) => ({
            value: item.ingredient_id,
            label: item.ingredient_name,
          }))
        );

        setCategoryOptions(
          categoriesRes.data.map((item) => ({
            value: item.category_id,
            label: item.category_name,
          }))
        );

      } catch (error) {
        console.error("❌ Error fetching data:", error);
        Swal.fire("Error", "ไม่สามารถดึงข้อมูลวัตถุดิบหรือหมวดหมู่ได้", "error");
      }
    };

    fetchData();
  }, []);

  // ✅ โหลดข้อมูลสูตรอาหารเมื่อแก้ไข
  useEffect(() => {
    if (!id) return;
    
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/api/recipes/${id}`);
        const recipeData = response.data;

        setRecipe({
          recipe_name: recipeData.name || "",
          category_id: recipeData.category_id || null,
          image_url: recipeData.image?.startsWith("http")
            ? recipeData.image
            : `http://localhost:3002/uploads/recipes/${recipeData.image}`,
          image: null,
        });

        setIngredients(
          recipeData.ingredients.map((ing) => ({
            ingredient_id: ing.ingredient_id,
            name: ing.name,
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
  }, [id]);

  // ✅ เลือกวัตถุดิบ
  const handleIngredientSelect = (selectedOption) => {
    if (!selectedOption) return;

    setIngredient((prev) => ({
      ...prev,
      ingredient_id: selectedOption.value,
      name: selectedOption.label,
    }));
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
      quantity: "",
      unit: "กรัม",
    });
  };

  // ✅ ส่งข้อมูลไป API
  const submitRecipe = async () => {
    if (!recipe.recipe_name || !recipe.category_id || ingredients.length === 0) {
      Swal.fire("Error", "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("recipe_name", recipe.recipe_name);
      formData.append("category_id", recipe.category_id);
      if (recipe.image) {
        formData.append("image", recipe.image);
      }
      formData.append("ingredients", JSON.stringify(ingredients));

      const url = id
        ? `http://localhost:3002/api/recipes/${id}`
        : "http://localhost:3002/api/recipes";

      const method = id ? "put" : "post";

      await axios({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("สำเร็จ", id ? "อัปเดตสูตรอาหารเรียบร้อย" : "บันทึกสูตรอาหารเรียบร้อย", "success")
        .then(() => navigate("/recipe"));

    } catch (error) {
      console.error("❌ Error submitting recipe:", error.response?.data || error.message);
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
          
          {/* ✅ อัปโหลดรูปภาพ */}
          <div className="form-section">
            <label>อัปโหลดรูปภาพ</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setRecipe((prev) => ({
                    ...prev,
                    image: file,
                    image_url: URL.createObjectURL(file),
                  }));
                }
              }}
            />
            {recipe.image_url && (
              <img
                src={recipe.image_url}
                alt="Preview"
                className="recipe-preview"
                
              />
            )}
          </div>
  
          {/* ✅ ชื่อสูตรอาหาร และหมวดหมู่ */}
          <div className="form-section">
            <label>ชื่อสูตรอาหาร</label>
            <input
              type="text"
              value={recipe.recipe_name}
              onChange={(e) => setRecipe({ ...recipe, recipe_name: e.target.value })}
            />
  
            {/* <div className="form-group">
              <label>หมวดหมู่อาหาร</label>
              <Select
                options={categoryOptions}
                value={categoryOptions.find((opt) => opt.value === recipe.category_id) || null}
                onChange={(selectedOption) =>
                  setRecipe((prev) => ({
                    ...prev,
                    category_id: selectedOption?.value || null,
                  }))
                }
                placeholder="เลือกหมวดหมู่..."
              />
            </div> */}
          </div>
  
          {/* ✅ วัตถุดิบ */}
          <div className="form-section">
            <h3>วัตถุดิบ</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>ชื่อวัตถุดิบ</label>
                <Select
                  options={ingredientOptions}
                  value={ingredientOptions.find((opt) => opt.value === ingredient.ingredient_id) || null}
                  onChange={handleIngredientSelect}
                  placeholder="ค้นหาวัตถุดิบ..."
                />
              </div>
  
              <div className="form-group">
                <label>ปริมาณ</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={ingredient.quantity}
                  onChange={handleIngredientsChange}
                />
              </div>
  
              <div className="form-group">
                <label>หน่วย</label>
                <Select
                  options={unitOptions}
                  value={unitOptions.find((opt) => opt.value === ingredient.unit) || null}
                  onChange={(selectedOption) =>
                    setIngredient((prev) => ({
                      ...prev,
                      unit: selectedOption.value,
                    }))
                  }
                  placeholder="เลือกหน่วย..."
                />
              </div>
  
              <button type="button" className="btn add-btn" onClick={addIngredients}>
                เพิ่มวัตถุดิบ
              </button>
            </div>
          </div>
  
          {/* ✅ แสดงรายการวัตถุดิบที่เพิ่มแล้ว */}
          {ingredients.length > 0 && (
            <div className="ingredient-list">
              <h4>รายการวัตถุดิบที่เพิ่มแล้ว</h4>
              <table>
                <thead>
                  <tr>
                    <th>ชื่อวัตถุดิบ</th>
                    <th>ปริมาณ</th>
                    <th>หน่วย</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing, index) => (
                    <tr key={index}>
                      <td>{ing.name.trim()}</td>
                      <td>{ing.quantity}</td>
                      <td>{ing.unit || "กรัม"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn delete-btn"
                          onClick={() =>
                            setIngredients(ingredients.filter((_, i) => i !== index))
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
          )}
  
          {/* ✅ ปุ่มยกเลิกและยืนยัน */}
          <div className="form-buttons">
            <button type="button" className="btn cancel-btn" onClick={() => navigate("/recipe")}>
              ยกเลิก
            </button>
            <button type="button" className="btn save-btn" onClick={submitRecipe}>
              ยืนยัน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default Addrecipe;
