import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import axios from "axios";
import Swal from "sweetalert2";
import "./TableDetails.scss";

const TableDetails = () => {
  const { tableId } = useParams();
  const [tableDetails, setTableDetails] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ฟังก์ชันดึงข้อมูลโต๊ะและรายการออเดอร์
  const fetchTableDetails = useCallback(async () => {
    try {
      const tableRes = await axios.get(`/api/tables/${tableId}`);
      const ordersRes = await axios.get(`/api/orders?table_id=${tableId}`);
      setTableDetails(tableRes.data);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลโต๊ะ:", error);
    } finally {
      setLoading(false);
    }
  }, [tableId]); // ✅ ใช้ useCallback เพื่อให้แน่ใจว่าฟังก์ชันนี้มีอยู่เสมอ

  useEffect(() => {
    fetchTableDetails();
  }, [fetchTableDetails]); // ✅ แก้ไขให้ไม่มี Warning

  // ✅ ฟังก์ชันยืนยันการชำระเงิน
  const handlePaymentConfirm = async () => {
    try {
      await axios.put("/api/orders/confirm-payment", { table_id: tableId });

      Swal.fire("สำเร็จ", "ชำระเงินเรียบร้อย!", "success").then(() => {
        fetchTableDetails(); // ✅ โหลดข้อมูลใหม่หลังชำระเงิน
      });
    } catch (error) {
      console.error("❌ Error confirming payment:", error);
      Swal.fire("Error", "ไม่สามารถบันทึกยอดขายได้", "error");
    }
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="table-details-container">
      <Navbar />
      <Sidebar />
      <div className="table-details-content">
        <div className="table-details-header">
          <h1>รายละเอียดโต๊ะหมายเลข {tableDetails.number || "N/A"}</h1>
          <p>สถานะ: {tableDetails.status || "ไม่ระบุ"}</p>
          <p>จำนวนที่นั่ง: {tableDetails.seats || "ไม่ระบุ"}</p>
        </div>

        <div className="orders-section">
          <h2>รายการออเดอร์</h2>
          {orders.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่อรายการ</th>
                  <th>จำนวน</th>
                  <th>ราคา (บาท)</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.id}>
                    <td>{index + 1}</td>
                    <td>{order.itemName || "ไม่มีข้อมูล"}</td>
                    <td>{order.quantity || "-"}</td>
                    <td>{order.price || "0.00"}</td>
                    <td>{order.status || "ไม่ระบุ"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>ยังไม่มีออเดอร์สำหรับโต๊ะนี้</p>
          )}
        </div>

        {/* ✅ ปุ่มยืนยันการชำระเงิน */}
        {orders.length > 0 && (
          <div className="payment-section">
            <button
              className="confirm-payment-btn"
              onClick={handlePaymentConfirm}
            >
              ✅ ยืนยันการชำระเงิน
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableDetails;
