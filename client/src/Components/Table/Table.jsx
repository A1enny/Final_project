import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
=======
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
import axios from "../Api/axios";
import Swal from "sweetalert2";
import { QRCodeCanvas } from "qrcode.react";
import Sidebar from "../Layout/Sidebar/Sidebar";
import Navbar from "../Layout/Navbar/Navbar";
import "./Table.scss";

const Table = () => {
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
<<<<<<< HEAD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    table_number: "",
    seats: "",
  });
  const navigate = useNavigate(); // ✅ ใช้สำหรับเปลี่ยนหน้า
=======
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a

  const fetchTables = async () => {
    try {
      let url = "http://localhost:3002/api/tables";
<<<<<<< HEAD
      const queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter)
        queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
      if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

=======
  
      // ✅ เช็คว่ามีค่าจริงก่อนเพิ่มพารามิเตอร์ลงไปใน URL
      const queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
  
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }
  
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
      const response = await axios.get(url);
      setTables(response.data);
    } catch (error) {
      console.error("❌ ดึงข้อมูลโต๊ะผิดพลาด:", error);
    }
  };
  

  useEffect(() => {
    fetchTables();
  }, [search, statusFilter]);

  useEffect(() => {
<<<<<<< HEAD
    const eventSource = new EventSource(
      "http://localhost:3002/api/tables/updates"
    );
=======
    const eventSource = new EventSource("http://localhost:3002/api/tables/updates");
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
    eventSource.onmessage = (event) => setTables(JSON.parse(event.data));
    return () => eventSource.close();
  }, []);

  const handleAction = async (url, successMessage) => {
    try {
      await axios.put(url);
<<<<<<< HEAD
      Swal.fire({
        title: "✅ สำเร็จ",
        text: successMessage,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
=======
      Swal.fire({ title: "✅ สำเร็จ", text: successMessage, icon: "success", timer: 1500, showConfirmButton: false });
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
      fetchTables();
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      Swal.fire("❌ ไม่สามารถดำเนินการได้", "กรุณาลองใหม่", "error");
    }
  };

<<<<<<< HEAD
  const handleAddTable = async () => {
    if (!newTable.table_number || !newTable.seats) {
      Swal.fire("❌ กรุณากรอกข้อมูลให้ครบ", "", "error");
      return;
    }
  
    try {
      await axios.post("http://localhost:3002/api/tables", {
        ...newTable,
        status: "available", // ✅ กำหนดค่า default
      });
  
      Swal.fire("✅ เพิ่มโต๊ะสำเร็จ!", "", "success");
      setIsModalOpen(false);
      fetchTables();
    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire("❌ ไม่สามารถเพิ่มโต๊ะได้", "กรุณาลองใหม่", "error");
    }
  };

=======
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
  return (
    <div className="Table-container">
      <Navbar />
      <Sidebar />
      <div className="Table-content">
        <h1>จัดการโต๊ะอาหาร</h1>
<<<<<<< HEAD

        {/* ปุ่มเพิ่มโต๊ะ */}
        <button className="add-table-btn" onClick={() => setIsModalOpen(true)}>
          ➕ เพิ่มโต๊ะ
        </button>

=======
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
        <div className="table-controls">
          <input
            type="text"
            placeholder="ค้นหาโต๊ะ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
<<<<<<< HEAD
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
=======
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
            <option value="">ทั้งหมด</option>
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
          </select>
        </div>

        <table className="Table-data">
          <thead>
            <tr>
              <th>หมายเลขโต๊ะ</th>
              <th>จำนวนที่นั่ง</th>
              <th>สถานะ</th>
              <th>QR Code</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.table_id}>
                <td>{table.table_number}</td>
                <td>{table.seats}</td>
                <td><span className={`status ${table.status}`}>{table.status}</span></td>
                <td><QRCodeCanvas value={`http://192.168.1.44:5173/order/${table.table_id}?guest=true`} size={50} /></td>
                <td>
                  <QRCodeCanvas
                    value={`http://192.168.1.44:5173/order/${table.table_id}?guest=true`}
                    size={100}
                  />
                </td>
                <td>
                  <div className="button-group">
<<<<<<< HEAD
                    {table.status === "available" && (
                      <button
                        className="start-btn"
                        onClick={() =>
                          handleAction(
                            `http://localhost:3002/api/tables/${table.table_id}/start`,
                            "โต๊ะถูกใช้งานแล้ว"
                          )
                        }
                      >
                        ▶ เริ่มใช้งาน
                      </button>
                    )}
                    {table.status === "in-use" && (
                      <button
                        className="reset-btn"
                        onClick={() =>
                          handleAction(
                            `http://localhost:3002/api/tables/${table.table_id}/reset`,
                            "โต๊ะกลับมาใช้งานได้แล้ว"
                          )
                        }
                      >
                        🔄 คืนโต๊ะ
                      </button>
                    )}
                    <button
                      onClick={() => {
                        console.log(
                          "📌 Navigating to:",
                          `/table-details/${table.table_id}`
                        ); // ✅ Debug
                        navigate(`/table-details/${table.table_id}`);
                      }}
                    >
                      ℹ️ ดูรายละเอียด
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleAction(
                          `http://localhost:3002/api/tables/${table.table_id}/delete`,
                          "โต๊ะถูกลบแล้ว"
                        )
                      }
                    >
                      🗑 ลบ
                    </button>
=======
                    {table.status === "available" && <button className="start-btn" onClick={() => handleAction(`http://localhost:3002/api/tables/${table.table_id}/start`, "โต๊ะถูกใช้งานแล้ว")}>▶ เริ่มใช้งาน</button>}
                    {table.status === "in-use" && <button className="reset-btn" onClick={() => handleAction(`http://localhost:3002/api/tables/${table.table_id}/reset`, "โต๊ะกลับมาใช้งานได้แล้ว")}>🔄 คืนโต๊ะ</button>}
                    <button className="delete-button" onClick={() => handleAction(`http://localhost:3002/api/tables/${table.table_id}/delete`, "โต๊ะถูกลบแล้ว")}>🗑 ลบ</button>
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal ฟอร์มเพิ่มโต๊ะ */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>➕ เพิ่มโต๊ะใหม่</h2>
            <label>หมายเลขโต๊ะ:</label>
            <input
              type="text"
              value={newTable.table_number}
              onChange={(e) =>
                setNewTable({ ...newTable, table_number: e.target.value })
              }
            />
            <label>จำนวนที่นั่ง:</label>
            <input
              type="number"
              value={newTable.seats}
              onChange={(e) =>
                setNewTable({ ...newTable, seats: e.target.value })
              }
            />
            <div className="modal-buttons">
              <button onClick={handleAddTable}>✅ เพิ่มโต๊ะ</button>
              <button onClick={() => setIsModalOpen(false)}>❌ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
