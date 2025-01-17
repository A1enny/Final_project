import "./Login.scss";
import "../../App.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import Logo from "../../assets/Logo.png";
import { FaUserShield } from "react-icons/fa";
import { FaKey } from "react-icons/fa";
import { AiOutlineSwapRight } from "react-icons/ai";

const Login = () => {
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // สำหรับแสดงสถานะการโหลด
  const navigateTo = useNavigate(); // ใช้ navigate เพื่อเปลี่ยนหน้า

  const loginUser = async (event) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้า

    // Validation เบื้องต้น
    if (!loginUserName || !loginPassword) {
      alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    try {
      setIsLoading(true); // เริ่มแสดงสถานะโหลด
      const response = await Axios.post("http://localhost:3002/api/login", {
        username: loginUserName, // แก้ไขชื่อฟิลด์ให้ตรงกับ backend
        password: loginPassword, // แก้ไขชื่อฟิลด์ให้ตรงกับ backend
      });

      if (response.status === 200 && response.data.user) {
        // หาก Login สำเร็จ และมีข้อมูลผู้ใช้
        alert(response.data.message); // แสดงข้อความ "Login successful"
        localStorage.setItem("username", response.data.user.username); // บันทึกชื่อผู้ใช้ลง Local Storage
        navigateTo("/dashboard"); // เปลี่ยนหน้าไปยัง /dashboard
      } else {
        alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else if (error.response && error.response.status === 404) {
        alert("ไม่พบ API endpoint โปรดตรวจสอบ URL");
      } else {
        console.error("Error logging in:", error);
        alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } finally {
      setIsLoading(false); // ซ่อนสถานะโหลด
    }
  };

  return (
    <div className="loginPage flex">
      <div className="logoContainer">
        <img src={Logo} alt="Logo Image" />
      </div>
      <div className="lang">
        <span>TH | EN</span>
      </div>
      <div className="contanier flex">
        <div className="textDiv">
          <h1 className="title">เข้าสู่ระบบ</h1>
          <h2 className="title">ระบบจัดการร้านอาหาร</h2>
          <p className="p">เเมวมองร้านอาหารญี่ปุ่น</p>
          <form className="form grid" onSubmit={loginUser}>
            <div className="inputDiv">
              <label htmlFor="username">ชื่อผู้ใช้</label>
              <div className="input flex">
                <FaUserShield className="icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={loginUserName}
                  onChange={(event) => setLoginUserName(event.target.value)}
                />
              </div>
            </div>
            <div className="inputDiv">
              <label htmlFor="Password">รหัสผ่าน</label>
              <div className="input flex">
                <FaKey className="icon" />
                <input
                  type="password"
                  id="Password"
                  placeholder="กรอกรหัสผ่าน"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn flex" disabled={isLoading}>
              {isLoading ? (
                <span>กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <AiOutlineSwapRight className="icon" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
