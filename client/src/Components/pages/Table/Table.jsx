import { useEffect, useState } from "react";
import axios from "../../../Api/axios";
import Swal from "sweetalert2";
import { QRCodeCanvas } from "qrcode.react";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import Navbar from "../../Layout/Navbar/Navbar";
import "./Table.scss";

const Table = () => {
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTables = async () => {
    try {
      let url = "http://localhost:3002/api/tables";
  
      // ✅ เช็คว่ามีค่าจริงก่อนเพิ่มพารามิเตอร์ลงไปใน URL
      const queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
  
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }
  
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
    const eventSource = new EventSource("http://localhost:3002/api/tables/updates");
    eventSource.onmessage = (event) => setTables(JSON.parse(event.data));
    return () => eventSource.close();
  }, []);

  const handleAction = async (url, successMessage) => {
    try {
      await axios.put(url);
      Swal.fire({ title: "✅ สำเร็จ", text: successMessage, icon: "success", timer: 1500, showConfirmButton: false });
      fetchTables();
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      Swal.fire("❌ ไม่สามารถดำเนินการได้", "กรุณาลองใหม่", "error");
    }
  };

  return (
    <div className="Table-container">
      <Navbar />
      <Sidebar />
      <div className="Table-content">
        <h1>จัดการโต๊ะอาหาร</h1>
        <div className="table-controls">
          <input
            type="text"
            placeholder="ค้นหาโต๊ะ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                  <div className="button-group">
                    {table.status === "available" && <button className="start-btn" onClick={() => handleAction(`http://localhost:3002/api/tables/${table.table_id}/start`, "โต๊ะถูกใช้งานแล้ว")}>▶ เริ่มใช้งาน</button>}
                    {table.status === "in-use" && <button className="reset-btn" onClick={() => handleAction(`http://localhost:3002/api/tables/${table.table_id}/reset`, "โต๊ะกลับมาใช้งานได้แล้ว")}>🔄 คืนโต๊ะ</button>}
                    <button className="delete-button" onClick={() => handleAction(`http://localhost:3002/api/tables/${table.table_id}/delete`, "โต๊ะถูกลบแล้ว")}>🗑 ลบ</button>
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
