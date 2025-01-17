import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import Swal from "sweetalert2";
import axios from "axios";
import "./Starttable.scss";

const StartTable = () => {
  const { tableId } = useParams(); // ดึง tableId จาก URL
  const navigate = useNavigate(); // ใช้สำหรับนำทางกลับไปหน้าหลัก
  const [customerCount, setCustomerCount] = useState(""); // เก็บจำนวนลูกค้า
  const [tableNumber, setTableNumber] = useState(""); // เก็บ tableNumber

  // ฟังก์ชันดึงข้อมูลโต๊ะ
  useEffect(() => {
    const fetchTableDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/api/tables/${tableId}`);
        setTableNumber(response.data.table_number); // ดึง table_number จาก API
      } catch (error) {
        console.error("Error fetching table details:", error);
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลโต๊ะได้", "error");
      }
    };

    fetchTableDetails();
  }, [tableId]);

  // ฟังก์ชันจัดการการส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า

    if (!customerCount || customerCount <= 0) {
      Swal.fire("ข้อผิดพลาด", "กรุณากรอกจำนวนลูกค้าที่ถูกต้อง", "error");
      return;
    }

    try {
      // ส่งข้อมูลไปยัง API
      await axios.put(`http://localhost:3002/api/tables/${tableId}`, {
        status: "ไม่ว่าง",
        customer_count: customerCount,
      });

      Swal.fire("สำเร็จ", "เริ่มใช้งานโต๊ะเรียบร้อยแล้ว", "success").then(() =>
        navigate("/table") // นำทางกลับไปหน้าหลัก
      );
    } catch (error) {
      console.error("Error starting table:", error);
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถเริ่มใช้งานโต๊ะได้", "error");
    }
  };

  return (
    <div className="StartTable-container">
      <Navbar />
      <Sidebar />
      <div className="StartTable-content">
        <h1>เริ่มใช้งานโต๊ะ {tableNumber || tableId}</h1>
        <p>คุณกำลังเริ่มใช้งานโต๊ะหมายเลข {tableNumber || tableId}</p>
        <form className="start-table-form" onSubmit={handleSubmit}>
          <label htmlFor="customerCount">จำนวนลูกค้า:</label>
          <input
            type="number"
            id="customerCount"
            placeholder="กรอกจำนวนลูกค้า"
            value={customerCount}
            onChange={(e) => setCustomerCount(e.target.value)}
          />
          <button type="submit" className="start-table-button">
            ยืนยันการใช้งานโต๊ะ
          </button>
        </form>
      </div>
    </div>
  );
};

export default StartTable;
