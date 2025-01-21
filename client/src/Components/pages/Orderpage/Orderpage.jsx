import { useState, useEffect } from "react";
import axios from "../../Api/axios";
import { useNavigate } from "react-router-dom";
import socket from "../../Api/socket";
import Swal from "sweetalert2";
import "./Orderpage.scss";

const OrderPage = () => {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
    }
  };

  useEffect(() => {
    socket.on("new_order", (data) => {
      console.log("📡 ออเดอร์ใหม่เข้ามา:", data);
      fetchOrders();
    });

    return () => socket.off("new_order");
  }, []);

  useEffect(() => {
    axios
      .get("http://192.168.1.44:3002/api/menus")
      .then((response) => {
        console.log("📡 เมนูที่ได้รับจาก API:", response.data);
        setMenu(response.data);
      })
      .catch((error) => {
        console.error("Error fetching menu:", error);
      });
  }, []);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      return existingItem
        ? prevCart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      Swal.fire("ตะกร้าว่างเปล่า", "กรุณาเลือกสินค้า", "warning");
      return;
    }

    try {
      const response = await axios.post("/orders", { items: cart });
      socket.emit("new_order", response.data);
      Swal.fire("สั่งซื้อสำเร็จ", "ออเดอร์ของคุณถูกส่งแล้ว", "success").then(
        () => navigate("/order-summary")
      );
    } catch (error) {
      console.error("Error placing order:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถสั่งซื้อได้", "error");
    }
  };

  return (
    <div className="order-page">
      <h2>เมนูอาหาร</h2>
      <div className="menu-list">
        {menu.length > 0 ? (
          menu.map((item) => (
            <div key={item.menu_id} className="menu-item">
              <img
                src={item.menu_image}
                alt={item.menu_name}
                onError={(e) => (e.target.src = "fallback-image.png")}
              />
              <h3>{item.menu_name}</h3>
              <p>{parseFloat(item.price).toFixed(2)} บาท</p>
              <button onClick={() => addToCart(item)}>เพิ่มลงตะกร้า</button>
            </div>
          ))
        ) : (
          <p>📌 ไม่มีเมนูอาหารที่พร้อมให้บริการ</p>
        )}
      </div>

      <h2>ตะกร้าสินค้า</h2>
      <div className="cart">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
              <h3>{item.name}</h3>
              <p>{Number(item.price).toFixed(2)} บาท</p>
              <div className="quantity-controls">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="remove-btn"
              >
                ลบ
              </button>
            </div>
          ))
        ) : (
          <p>🛒 ตะกร้าว่างเปล่า</p>
        )}
      </div>

      <h2>รายการออเดอร์</h2>
      <ul>
        {orders.length > 0 ? (
          orders.map((order) => (
            <li key={order.id}>
              โต๊ะ {order.table_number} - {order.recipe_name} - {order.quantity}{" "}
              ชิ้น
            </li>
          ))
        ) : (
          <p>⏳ ไม่มีออเดอร์ที่กำลังดำเนินการ</p>
        )}
      </ul>

      <button
        onClick={placeOrder}
        className="place-order"
        disabled={cart.length === 0}
      >
        {cart.length > 0 ? "สั่งรายการ" : "เพิ่มสินค้าเพื่อสั่งซื้อ"}
      </button>
    </div>
  );
};

export default OrderPage;
