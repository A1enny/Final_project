import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../Api/axios";
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
    image_url: "http://localhost:3002/uploads/recipes/default.jpg",
  });

  const [ingredients, setIngredients] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

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
        Swal.fire(
          "Error",
          "ไม่สามารถดึงข้อมูลวัตถุดิบหรือหมวดหมู่ได้",
          "error"
        );
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/api/recipes/${id}`
        );
        const recipeData = response.data;

        console.log("📌 API Response:", recipeData); // ✅ Debug จุดนี้

        setRecipe((prev) => ({
          recipe_name: recipeData.name || "",
          category_id: recipeData.category_id || null,
          image_url:
            recipeData.image && recipeData.image !== "null"
              ? `http://localhost:3002/uploads/recipes/${recipeData.image}`
              : prev.image_url, // ✅ ใช้รูปเดิมหากมีอยู่
          image: null,
        }));

        setIngredients(
          recipeData.ingredients.map((ing) => ({
            ingredient_id: ing.ingredient_id,
            name: ing.ingredient_name && ing.ingredient_name !== "null"
              ? ing.ingredient_name
              : "ไม่พบชื่อ", // ✅ ป้องกันชื่อหาย
            quantity: ing.amount || 0,
            unit: ing.unit || "กรัม",
          }))
        );
        
      } catch (error) {
        console.error("❌ Error fetching recipe:", error);
        Swal.fire("Error", "ไม่สามารถโหลดข้อมูลสูตรอาหารได้", "error");
      }
    };

    fetchRecipe();
  }, [id]);

  const handleIngredientSelect = (selectedOption) => {
    setSelectedIngredient(selectedOption);
  };

  const handleIngredientQuantityChange = (e) => {
    setSelectedIngredient((prev) => ({
      ...prev,
      quantity: e.target.value,
    }));
  };

  const handleIngredientUnitChange = (selectedOption) => {
    setSelectedIngredient((prev) => ({
      ...prev,
      unit: selectedOption.value,
    }));
  };

  const addIngredient = () => {
    if (!selectedIngredient || !selectedIngredient.value) {
      Swal.fire("Error", "กรุณาเลือกวัตถุดิบ", "error");
      return;
    }

    setIngredients((prev) => [
      ...prev,
      {
        ingredient_id: selectedIngredient.value,
        name: selectedIngredient.label,
        quantity: selectedIngredient.quantity || 1,
        unit: selectedIngredient.unit || "กรัม",
      },
    ]);
    setSelectedIngredient(null);
  };
  const submitRecipe = async () => {
    if (!recipe.recipe_name || ingredients.length === 0) {
      Swal.fire("Error", "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("recipe_name", recipe.recipe_name);
      formData.append("category_id", recipe.category_id || ""); // ✅ ป้องกันค่า null

      if (recipe.image) {
        formData.append("image", recipe.image);
      } else {
        formData.append("image", recipe.image_url.split("/").pop()); // ✅ ใช้รูปเดิมหากไม่มีอัปโหลดใหม่
      }

      formData.append("ingredients", JSON.stringify(ingredients));

      // ✅ แก้ไข Syntax Error
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

      Swal.fire(
        "สำเร็จ",
        id ? "อัปเดตสูตรอาหารเรียบร้อย" : "บันทึกสูตรอาหารเรียบร้อย",
        "success"
      ).then(() => navigate("/recipe"));
    } catch (error) {
      console.error("❌ Error submitting recipe:", error);
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
                style={{
                  maxWidth: "600px",
                  maxHeight: "350px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          {/* ✅ ชื่อสูตรอาหาร และหมวดหมู่ */}
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

          {/* ✅ วัตถุดิบ */}
          <div className="form-section">
            <h3>วัตถุดิบ</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>ชื่อวัตถุดิบ</label>
                <Select
                  options={ingredientOptions}
                  value={selectedIngredient}
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
                  value={selectedIngredient?.quantity || ""}
                  onChange={handleIngredientQuantityChange}
                />
              </div>

              <div className="form-group">
                <label>หน่วย</label>
                <Select
                  options={unitOptions}
                  value={
                    unitOptions.find(
                      (opt) => opt.value === selectedIngredient?.unit
                    ) || null
                  }
                  onChange={handleIngredientUnitChange}
                  placeholder="เลือกหน่วย..."
                />
              </div>

              <button
                type="button"
                className="btn add-btn"
                onClick={addIngredient}
              >
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
                      <td>{ing.name}</td>
                      <td>{ing.quantity}</td>
                      <td>{ing.unit}</td>
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
          )}
          {/* ✅ ปุ่มยกเลิกและยืนยัน */}
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
