import { useState, useEffect } from "react";
<<<<<<< HEAD
import { useParams } from "react-router-dom"; // ⬅️ ใช้เพื่อดึง table_id จาก URL
import axios from "../../../Api/axios";
=======
import axios from "../../Api/axios";
import { useNavigate } from "react-router-dom";
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
import socket from "../../Api/socket";
import Swal from "sweetalert2";
import "./Orderpage.scss";

const OrderPage = () => {
<<<<<<< HEAD
  const { table_id } = useParams(); // ⬅️ ดึงค่า table_id จาก URL
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  // ดึงข้อมูลเมนูจาก API
=======
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

>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
  useEffect(() => {
    axios
      .get("http://192.168.1.44:3002/api/menus")
      .then((response) => {
        console.log("📡 เมนูที่ได้รับจาก API:", response.data);
        setMenu(response.data);
      })
      .catch((error) => {
<<<<<<< HEAD
        console.error("❌ เกิดข้อผิดพลาดในการดึงเมนู:", error);
      });
  }, []);

  // เพิ่มสินค้าไปยังตะกร้า
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.menu_id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.menu_id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevCart, { ...item, quantity: 1, menu_id: item.id }];
      }
    });
  };

  // ฟังก์ชันสั่งออเดอร์
  const placeOrder = async () => {
    if (!table_id) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถระบุโต๊ะได้", "error");
      return;
    }

    if (cart.length === 0) {
      Swal.fire("🛒 ตะกร้าว่างเปล่า", "กรุณาเลือกสินค้า", "warning");
=======
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
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
      return;
    }

    try {
<<<<<<< HEAD
      const session_id = `session-${table_id}-${Date.now()}`;
      const ordersPayload = cart.map((item) => ({
        menu_id: item.menu_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await axios.post(
        "http://192.168.1.44:3002/api/orders/bulk",
        {
          table_id: table_id, // ⬅️ ใช้ค่า table_id จาก URL
          session_id,
          orders: ordersPayload,
        }
      );

      // แจ้งเตือน WebSocket
      socket.emit("new_order", response.data);

      Swal.fire("✅ สั่งซื้อสำเร็จ", "ออเดอร์ของคุณถูกส่งแล้ว", "success").then(
        () => setCart([]) // เคลียร์ตะกร้าหลังจากสั่งซื้อสำเร็จ
      );
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการสั่งซื้อ:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถสั่งซื้อได้", "error");
    }
  };
  const updateQuantity = (menu_id, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.menu_id === menu_id
          ? { ...item, quantity: Math.max(1, quantity) } // ห้ามลดต่ำกว่า 1
          : item
      )
    );
  };
  

  return (
    <div className="order-page">
      <h2>📦 รายการออเดอร์สำหรับโต๊ะ {table_id}</h2>
      <h3>📜 เมนูอาหาร</h3>
      <div className="menu-list">
        {menu.length > 0 ? (
          menu.map((item) => (
            <div key={item.id} className="menu-item">
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => (e.target.src = "fallback-image.png")}
              />
              <h3>{item.name}</h3>
              <p>{Number(item.price).toFixed(2)} บาท</p>
              <button onClick={() => addToCart(item)}>🛒 เพิ่มลงตะกร้า</button>
=======
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
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
            </div>
          ))
        ) : (
          <p>📌 ไม่มีเมนูอาหารที่พร้อมให้บริการ</p>
        )}
      </div>

<<<<<<< HEAD
      <h3 className="bucket">🛍️ ตะกร้าสินค้า</h3>
      <div className="cart">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.menu_id} className="cart-item">
=======
      <h2>ตะกร้าสินค้า</h2>
      <div className="cart">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
              <h3>{item.name}</h3>
              <p>{Number(item.price).toFixed(2)} บาท</p>
              <div className="quantity-controls">
                <button
<<<<<<< HEAD
                  onClick={() =>
                    updateQuantity(item.menu_id, item.quantity + 1)
                  }
                >
                  ➕
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.menu_id, item.quantity - 1)
                  }
                >
                  ➖
                </button>
              </div>
              <button
                onClick={() =>
                  setCart(cart.filter((i) => i.menu_id !== item.menu_id))
                }
              >
                ❌ ลบ
=======
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
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
              </button>
            </div>
          ))
        ) : (
          <p>🛒 ตะกร้าว่างเปล่า</p>
        )}
      </div>

<<<<<<< HEAD
=======
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

>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
      <button
        onClick={placeOrder}
        className="place-order"
        disabled={cart.length === 0}
      >
<<<<<<< HEAD
        {cart.length > 0 ? "✅ สั่งรายการ" : "🛒 เพิ่มสินค้าเพื่อสั่งซื้อ"}
=======
        {cart.length > 0 ? "สั่งรายการ" : "เพิ่มสินค้าเพื่อสั่งซื้อ"}
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
      </button>
    </div>
  );
};

export default OrderPage;
