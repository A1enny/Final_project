import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Table.scss";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import axios from "axios";
import Swal from "sweetalert2";

const Table = () => {
  const [tables, setTables] = useState([]); // ✅ กำหนด state สำหรับข้อมูลโต๊ะ
  const [searchTerm, setSearchTerm] = useState(""); // ✅ กำหนด state สำหรับการค้นหา
  const [filter, setFilter] = useState(""); // ✅ กำหนด state สำหรับตัวกรอง
  const navigate = useNavigate();

  
  // ✅ ดึงข้อมูลโต๊ะจาก Backend เมื่อโหลดหน้า
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/tables");
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
      Swal.fire("Error", "ไม่สามารถดึงข้อมูลโต๊ะได้", "error");
    }
  };

  // ✅ ค้นหาโต๊ะตามหมายเลข หรือสถานะ
  const handleSearch = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3002/api/tables/search",
        {
          params: { search: searchTerm, status: filter },
        }
      );
      setTables(response.data);
    } catch (error) {
      Swal.fire("Error", "ไม่พบโต๊ะที่ค้นหา", "warning");
    }
  };

  // ✅ เพิ่มโต๊ะใหม่
  const handleAddTable = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มโต๊ะใหม่",
      html: `
        <input id="tableNumber" class="swal2-input" placeholder="หมายเลขโต๊ะ">
        <input id="seats" class="swal2-input" placeholder="จำนวนที่นั่ง" type="number">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => ({
        table_number: document.getElementById("tableNumber").value,
        seats: document.getElementById("seats").value,
      }),
    });

    if (formValues) {
      try {
        await axios.post("http://localhost:3002/api/tables", formValues);
        fetchTables(); // ✅ โหลดข้อมูลใหม่หลังจากเพิ่ม
        Swal.fire("สำเร็จ!", "เพิ่มโต๊ะใหม่เรียบร้อย", "success");
      } catch (error) {
        Swal.fire("Error", "ไม่สามารถเพิ่มโต๊ะได้", "error");
      }
    }
  };

  // ✅ ลบโต๊ะ
  const handleDeleteTable = async (id) => {
    Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบโต๊ะนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3002/api/tables/${id}`);
          fetchTables(); // ✅ โหลดข้อมูลใหม่หลังจากลบ
          Swal.fire("ลบสำเร็จ!", "โต๊ะถูกลบแล้ว", "success");
        } catch (error) {
          Swal.fire("Error", "ไม่สามารถลบโต๊ะได้", "error");
        }
      }
    });
  };

  return (
    <div className="Table-container">
      <Navbar />
      <Sidebar />
      <div className="Table-content">
        <h1>จัดการโต๊ะอาหาร</h1>
        <div className="Table-filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="">ตัวกรองทั้งหมด</option>
            <option value="available">ว่าง</option>
            <option value="occupied">ไม่ว่าง</option>
            <option value="reserved">จองแล้ว</option>
          </select>
          <input
            type="text"
            placeholder="ค้นหา หมายเลขโต๊ะ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            ค้นหา
          </button>
          <button onClick={handleAddTable} className="add-button">
            เพิ่มโต๊ะใหม่
          </button>
        </div>
        <table className="Table-data">
          <thead>
            <tr>
              <th>หมายเลขโต๊ะ</th>
              <th>จำนวนที่นั่ง</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.table_id}>
                <td>{table.table_number}</td>
                <td>{table.seats}</td>
                <td>
                  <span className={`status ${table.status}`}>
                    {table.status}
                  </span>
                </td>
                <td>
                  <div className="button-group">
                    <button className="details-button">ดูรายละเอียด</button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteTable(table.table_id)}
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
