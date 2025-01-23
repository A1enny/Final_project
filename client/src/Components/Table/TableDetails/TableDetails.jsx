import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../Api/axios/";
import socket from "../../Api/socket";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./TableDetails.scss";
import Swal from "sweetalert2";

import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "react-qr-code"; // ✅ ใช้ react-qr-code ที่ถูกต้อง

// ✅ ฟังก์ชันสร้างใบเสร็จ
const generateReceipt = (orders, table) => {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("BK GROUP", 14, 10);
  doc.setFontSize(12);
  doc.text("BKGROUP", 14, 18);
  doc.text("TEL: 089-9550001", 14, 24);

  doc.setFontSize(14);
  doc.text(`โต๊ะ: ${table.table_number}`, 14, 35);
  doc.setFontSize(12);
  doc.text(`จำนวนที่นั่ง: ${table.seats}`, 14, 42);
  doc.text(`สถานะ: ${table.status}`, 14, 48);

  const tableColumn = ["ชื่อเมนู", "จำนวน", "ราคา"];
  const tableRows = [];

  let totalAmount = 0;
  orders.forEach((order) => {
    const rowData = [
      order.recipe_name,
      order.quantity, // ✅ ตรวจสอบให้ใช้ `quantity` ไม่ใช่ `total_quantity`
      `${Number(order.total_price).toFixed(2)} บาท`,
    ];
    totalAmount += order.total_price;
    tableRows.push(rowData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 55,
  });

  doc.text(
    `รวมเป็นเงิน: ${totalAmount.toFixed(2)} บาท`,
    14,
    doc.lastAutoTable.finalY + 10
  );
  doc.text(
    `ยอดชำระสุทธิ: ${totalAmount.toFixed(2)} บาท`,
    14,
    doc.lastAutoTable.finalY + 20
  );

  const currentDate = new Date().toLocaleString();
  doc.text(currentDate, 14, doc.lastAutoTable.finalY + 30);

  doc.save(`Receipt_Table_${table.table_number}.pdf`);
};

const TableDetails = () => {
  const { table_id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const promptPayNumber = "0657317994"; // เปลี่ยนเป็น PromptPay จริง
  const fetchTableDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3002/api/tables/${table_id}`
      );
      setTable(response.data);
    } catch (error) {
      console.error("❌ ดึงข้อมูลโต๊ะผิดพลาด:", error);
    }
  };

  useEffect(() => {
    const fetchTableDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/api/tables/${table_id}`
        );
        setTable(response.data);
      } catch (error) {
        console.error("❌ ดึงข้อมูลโต๊ะผิดพลาด:", error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/api/orders?table_id=${table_id}`
        );
        if (Array.isArray(response.data)) {
          setOrders(response.data);
          const total = response.data.reduce(
            (sum, order) => sum + Number(order.total_price),
            0
          );
          setTotalPrice(total);
        } else {
          console.error("❌ ค่าที่ได้จาก API ไม่ใช่ array:", response.data);
        }
      } catch (error) {
        console.error("❌ ดึงข้อมูลออร์เดอร์ผิดพลาด:", error);
      }
    };

    fetchTableDetails();
    fetchOrders();

    socket.on("new_order", (newOrder) => {
      if (newOrder.table_id === parseInt(table_id)) {
        setOrders((prevOrders) => [...prevOrders, newOrder]);
      }
    });

    return () => {
      socket.off("new_order");
    };
  }, [table_id]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/inventory");
      console.log("🎯 คลังวัตถุดิบล่าสุด:", response.data);
    } catch (error) {
      console.error("❌ ดึงข้อมูลคลังวัตถุดิบผิดพลาด:", error);
    }
  };

  const handlePaymentConfirm = async () => {
    try {
      await axios.put("http://localhost:3002/api/orders/confirm-payment", {
        table_id,
      });

      // ✅ แจ้งเตือนว่าชำระเงินสำเร็จ
      Swal.fire("✅ ชำระเงินสำเร็จ!", "บันทึกยอดขายแล้ว", "success");

      // ✅ รีโหลดสถานะโต๊ะให้เป็น available
      fetchTableDetails();

      // ✅ รีโหลดข้อมูลคลังวัตถุดิบ
      fetchInventory();

      // ✅ รีเซ็ตข้อมูลหน้าเว็บ
      setOrders([]);
      setTotalPrice(0);
      setIsPaid(false);
    } catch (error) {
      console.error("❌ อัปเดตสถานะผิดพลาด:", error);
      Swal.fire("❌ ไม่สามารถบันทึกยอดขายได้", "กรุณาลองใหม่", "error");
    }
  };

  if (!table) {
    return <p>⏳ กำลังโหลดข้อมูล...</p>;
  }

  return (
    <div className="TableDetails-container">
      <Navbar />
      <Sidebar />
      <div className="TableDetails-content">
        <h1>รายละเอียดโต๊ะ: {table.table_number}</h1>
        <p>
          <strong>จำนวนที่นั่ง:</strong> {table.seats}
        </p>
        <p>
          <strong>สถานะ:</strong> {table.status}
        </p>
        <h2>📜 รายการออร์เดอร์</h2>
        {orders.length > 0 ? (
          <table className="order-table">
            <thead>
              <tr>
                <th>ชื่อเมนู</th>
                <th>จำนวน</th>
                <th>ราคา</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.recipe_name || "❌ ไม่มีข้อมูล"}</td>
                  <td>{order.quantity}</td>
                  <td>{Number(order.total_price).toFixed(2)} บาท</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>ยังไม่มีออร์เดอร์</p>
        )}
        <h3>💰 ยอดรวม: {totalPrice.toFixed(2)} บาท</h3>
        
        {!isPaid && (
          <div>
            <h2>📱 ชำระเงินผ่าน QR Code</h2>
            <img
              src={`https://promptpay.io/${promptPayNumber}/${totalPrice}.png`}
              alt="QR Code สำหรับชำระเงิน"
              width="200"
            />

            <p>📸 สแกนเพื่อชำระเงิน</p>
            <button onClick={handlePaymentConfirm}>✅ ยืนยันการชำระเงิน</button>
          </div>
        )}
        {!isPaid && (
          <button onClick={handlePaymentConfirm}>💵 รับเงินสด</button>
        )}
        {isPaid && (
          <button onClick={() => generateReceipt(orders, table)}>
            🖨️ พิมพ์ใบเสร็จ
          </button>
        )}
        <button onClick={() => navigate(-1)}>⬅️ กลับ</button>
      </div>
    </div>
  );
};

export default TableDetails;
