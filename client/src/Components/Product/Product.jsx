import { useState, useEffect } from "react";
import "./Product.scss";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";

const Product = () => {
  const [recipes, setRecipes] = useState([]); // 📌 ใช้ state recipes แทน products
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // ✅ ดึงข้อมูลสูตรอาหารจาก backend
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3002/api/recipes?page=${page}`
        );
        console.log("API Response:", response.data); // 🛠 Debugging
        if (response.data.results && Array.isArray(response.data.results)) {
          setRecipes(response.data.results);
          setTotalPages(response.data.totalPages);
        } else {
          setRecipes([]); // ไม่มีข้อมูล
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        Swal.fire("Error", "ไม่สามารถดึงข้อมูลเมนูอาหารได้", "error");
      }
      setLoading(false);
    };

    fetchRecipes();
  }, [page]);


  // ✅ ค้นหาเมนูอาหาร
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3002/api/recipes?search=${search}`
      );
      if (response.data.results) {
        setRecipes(response.data.results);
      }
    } catch (error) {
      console.error("Error searching recipes:", error);
      Swal.fire("Error", "ไม่พบข้อมูลที่ค้นหา", "warning");
    }
    setLoading(false);
  };

  // ✅ ฟังก์ชันแก้ไข
  const handleEdit = (recipe) => {
    navigate(`/editrecipe/${recipe.id}`);
  };

  // ✅ ฟังก์ชันลบเมนูอาหาร
  const handleDelete = async (id) => {
    Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3002/api/recipes/${id}`);
          setRecipes(recipes.filter((recipe) => recipe.id !== id));
          Swal.fire("ลบสำเร็จ!", "เมนูถูกลบออกจากระบบแล้ว", "success");
        } catch (error) {
          Swal.fire("Error", "ไม่สามารถลบเมนูได้", "error");
        }
      }
    });
  };

  // ✅ Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("รายการเมนูอาหาร", 14, 10);
    doc.autoTable({
      head: [["ลำดับ", "ชื่อเมนู", "หมวดหมู่"]],
      body: recipes.map((recipe, index) => [
        index + 1,
        recipe.name,
        recipe.category,
      ]),
    });
    doc.save("Recipes.pdf");
  };

  return (
    <div className="product-container">
      <Navbar />
      <Sidebar />
      <div className="product-content">
        <div className="productheader">
          <h1>จัดการเมนูอาหาร</h1>
          <div className="actions">
            <button className="btn export" onClick={handleExportPDF}>
              Export PDF
            </button>
          </div>
        </div>

        {/* ✅ ค้นหา */}
        <div className="filters">
          <input
            type="text"
            placeholder="ค้นหาชื่อเมนูอาหาร..."
            className="search-bar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn search" onClick={handleSearch}>
            ค้นหา
          </button>
        </div>

        {/* ✅ ตารางแสดงเมนูอาหาร */}
        <table className="product-table">
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>รูปภาพ</th>
              <th>ชื่อเมนู</th>
              <th>หมวดหมู่</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {recipes.length > 0 ? (
              recipes.map((recipe, index) => (
                <tr key={recipe.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={
                        recipe.image.startsWith("http")
                          ? recipe.image
                          : `http://localhost:3002/uploads/recipes/${recipe.image}`
                      }
                      alt={recipe.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.onerror = null; // ป้องกัน loop error
                        e.target.src =
                          "http://localhost:3002/uploads/recipes/default.jpg"; // Fallback image
                      }}
                    />
                  </td>

                  <td>{recipe.name}</td>
                  <td>{recipe.category || "ไม่ระบุหมวดหมู่"}</td>
                  <td>
                    <button
                      className="btn delete"
                      onClick={() => handleDelete(recipe.id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px", color: "red" }}
                >
                  ❌ ไม่มีข้อมูลเมนูอาหาร
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Pagination */}
        <div className="pagination">
          <button
            className="btn"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`btn ${page === index + 1 ? "active" : ""}`}
              onClick={() => setPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="btn"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || loading}
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
