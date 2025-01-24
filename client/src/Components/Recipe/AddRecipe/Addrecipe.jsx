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
<<<<<<< HEAD
=======
  const [ingredient, setIngredient] = useState({
    ingredient_id: null,
    name: "",
    quantity: "",
    unit: "กรัม",
  });

>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

<<<<<<< HEAD
=======
  // ✅ โหลดหมวดหมู่อาหาร (menu_category) และวัตถุดิบ (ingredients) ครั้งเดียว
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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
<<<<<<< HEAD
        Swal.fire(
          "Error",
          "ไม่สามารถดึงข้อมูลวัตถุดิบหรือหมวดหมู่ได้",
          "error"
        );
=======
        console.error("❌ Error fetching data:", error);
        Swal.fire("Error", "ไม่สามารถดึงข้อมูลวัตถุดิบหรือหมวดหมู่ได้", "error");
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
      }
    };

    fetchData();
  }, []);

<<<<<<< HEAD
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
=======
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
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a

        setIngredients(
          recipeData.ingredients.map((ing) => ({
            ingredient_id: ing.ingredient_id,
<<<<<<< HEAD
            name: ing.ingredient_name && ing.ingredient_name !== "null"
              ? ing.ingredient_name
              : "ไม่พบชื่อ", // ✅ ป้องกันชื่อหาย
            quantity: ing.amount || 0,
            unit: ing.unit || "กรัม",
          }))
        );
        
      } catch (error) {
        console.error("❌ Error fetching recipe:", error);
=======
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          }))
        );
      } catch (error) {
        console.error("Error fetching recipe:", error);
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
        Swal.fire("Error", "ไม่สามารถโหลดข้อมูลสูตรอาหารได้", "error");
      }
    };

    fetchRecipe();
  }, [id]);

<<<<<<< HEAD
  const handleIngredientSelect = (selectedOption) => {
    setSelectedIngredient(selectedOption);
=======
  // ✅ เลือกวัตถุดิบ
  const handleIngredientSelect = (selectedOption) => {
    if (!selectedOption) return;

    setIngredient((prev) => ({
      ...prev,
      ingredient_id: selectedOption.value,
      name: selectedOption.label,
    }));
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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

<<<<<<< HEAD
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
=======
    setIngredients((prev) => [...prev, ingredient]);
    setIngredient({
      ingredient_id: null,
      name: "",
      quantity: "",
      unit: "กรัม",
    });
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
  };
  const submitRecipe = async () => {
<<<<<<< HEAD
    if (!recipe.recipe_name || ingredients.length === 0) {
=======
    if (!recipe.recipe_name || !recipe.category_id || ingredients.length === 0) {
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
      Swal.fire("Error", "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("recipe_name", recipe.recipe_name);
<<<<<<< HEAD
      formData.append("category_id", recipe.category_id || ""); // ✅ ป้องกันค่า null

      if (recipe.image) {
        formData.append("image", recipe.image);
      } else {
        formData.append("image", recipe.image_url.split("/").pop()); // ✅ ใช้รูปเดิมหากไม่มีอัปโหลดใหม่
=======
      formData.append("category_id", recipe.category_id);
      if (recipe.image) {
        formData.append("image", recipe.image);
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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

<<<<<<< HEAD
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
=======
    } catch (error) {
      console.error("❌ Error submitting recipe:", error.response?.data || error.message);
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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
<<<<<<< HEAD
=======
          
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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
<<<<<<< HEAD
                style={{
                  maxWidth: "600px",
                  maxHeight: "350px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

=======
                
              />
            )}
          </div>
  
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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
<<<<<<< HEAD

=======
  
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
          {/* ✅ วัตถุดิบ */}
          <div className="form-section">
            <h3>วัตถุดิบ</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>ชื่อวัตถุดิบ</label>
                <Select
                  options={ingredientOptions}
<<<<<<< HEAD
                  value={selectedIngredient}
=======
                  value={ingredientOptions.find((opt) => opt.value === ingredient.ingredient_id) || null}
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
                  onChange={handleIngredientSelect}
                  placeholder="ค้นหาวัตถุดิบ..."
                />
              </div>
<<<<<<< HEAD

=======
  
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
              <div className="form-group">
                <label>ปริมาณ</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
<<<<<<< HEAD
                  value={selectedIngredient?.quantity || ""}
                  onChange={handleIngredientQuantityChange}
                />
              </div>

=======
                  value={ingredient.quantity}
                  onChange={handleIngredientsChange}
                />
              </div>
  
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
              <div className="form-group">
                <label>หน่วย</label>
                <Select
                  options={unitOptions}
<<<<<<< HEAD
                  value={
                    unitOptions.find(
                      (opt) => opt.value === selectedIngredient?.unit
                    ) || null
=======
                  value={unitOptions.find((opt) => opt.value === ingredient.unit) || null}
                  onChange={(selectedOption) =>
                    setIngredient((prev) => ({
                      ...prev,
                      unit: selectedOption.value,
                    }))
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
                  }
                  onChange={handleIngredientUnitChange}
                  placeholder="เลือกหน่วย..."
                />
              </div>
<<<<<<< HEAD

              <button
                type="button"
                className="btn add-btn"
                onClick={addIngredient}
              >
=======
  
              <button type="button" className="btn add-btn" onClick={addIngredients}>
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
                เพิ่มวัตถุดิบ
              </button>
            </div>
          </div>
<<<<<<< HEAD

=======
  
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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
<<<<<<< HEAD
                      <td>{ing.name}</td>
                      <td>{ing.quantity}</td>
                      <td>{ing.unit}</td>
=======
                      <td>{ing.name.trim()}</td>
                      <td>{ing.quantity}</td>
                      <td>{ing.unit || "กรัม"}</td>
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
                      <td>
                        <button
                          type="button"
                          className="btn delete-btn"
                          onClick={() =>
<<<<<<< HEAD
                            setIngredients(
                              ingredients.filter((_, i) => i !== index)
                            )
=======
                            setIngredients(ingredients.filter((_, i) => i !== index))
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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
<<<<<<< HEAD
=======
  
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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
