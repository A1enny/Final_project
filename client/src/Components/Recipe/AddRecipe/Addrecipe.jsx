import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../Api/axios";
import Swal from "sweetalert2";
import Select from "react-select";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./Addrecipe.scss";

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
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ingredientsRes = await axios.get(
          "http://localhost:3002/api/ingredients?limit=1000"
        );
        setIngredientOptions(
          ingredientsRes.data.results.map((item) => ({
            value: item.ingredient_id,
            label: item.ingredient_name,
          }))
        );
      } catch (error) {
        Swal.fire("Error", "ไม่สามารถดึงข้อมูลวัตถุดิบได้", "error");
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

        console.log("📌 API Response:", recipeData);
        setRecipe((prev) => ({
          recipe_name: recipeData.name || "",
          category_id: recipeData.category_id || null,
          image_url: recipeData.image.startsWith("http")
            ? recipeData.image // ถ้าเป็น URL เต็มอยู่แล้ว ให้ใช้ค่าปัจจุบัน
            : `http://localhost:3002/uploads/recipes/${recipeData.image}`, // ถ้าไม่ใช่ URL เต็ม ให้เติม path
        }));
        
        setIngredients(
          recipeData.ingredients.map((ing) => ({
            ingredient_id: ing.ingredient_id,
            name: ing.name || "ไม่พบชื่อ",
            quantity: ing.quantity || 0,
            type: ing.type || "ไม่ระบุ",
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

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const addIngredient = () => {
    if (!selectedIngredient || !quantity) {
      Swal.fire("Error", "กรุณาเลือกวัตถุดิบและปริมาณ", "error");
      return;
    }

    setIngredients((prev) => [
      ...prev,
      {
        ingredient_id: selectedIngredient.value,
        name: selectedIngredient.label,
        quantity,
      },
    ]);

    setSelectedIngredient(null);
    setQuantity("");
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const submitRecipe = async () => {
    if (!recipe.recipe_name || ingredients.length === 0) {
      Swal.fire("Error", "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("recipe_name", recipe.recipe_name);
      formData.append("category_id", recipe.category_id || "");
      formData.append("ingredients", JSON.stringify(ingredients));

      if (recipe.image) {
        formData.append("image", recipe.image);
      } else if (recipe.image_url && !recipe.image_url.includes("default.jpg")) {
        formData.append("image_url", recipe.image_url); // ใช้ URL เดิมหากมี
      }    

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

      Swal.fire("สำเร็จ", "อัปเดตสูตรอาหารเรียบร้อย", "success").then(() =>
        navigate("/recipe")
      );
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
                  value={selectedIngredient || null}
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
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>

              <button
                type="button"
                className="btn add-btn"
                onClick={addIngredient} // ✅ ใช้ชื่อฟังก์ชันที่ถูกต้อง
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
                      <td>{ing.name.trim()}</td>
                      <td>{ing.quantity}</td>
                      <td>{ing.unit || "กรัม"}</td>
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
