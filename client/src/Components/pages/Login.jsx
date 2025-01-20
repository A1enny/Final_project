import "./Login.scss";
import "../../App.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../../Api/axios";
import Swal from "sweetalert2";
import Logo from "../../assets/Logo.png";
import { FaUserShield, FaKey } from "react-icons/fa";
import { AiOutlineSwapRight } from "react-icons/ai";

const Login = () => {
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async (event) => {
    event.preventDefault();

    if (!loginUserName || !loginPassword) {
      Swal.fire("❌ ข้อมูลไม่ครบ", "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน", "error");
      return;
    }

    try {
      setIsLoading(true);

      const response = await Axios.post("/auth/login", {
        username: loginUserName,
        password: loginPassword,
      });
      
      console.log("📌 Sending Login Data:", JSON.stringify({
        username: loginUserName,
        password: loginPassword
      }));
      
      console.log("🔍 Response Data:", response.data);

      if (response.status === 200 && response.data.token) {
        const { user, token } = response.data;

        // ✅ เก็บข้อมูลลง LocalStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user_id", user.id);
        localStorage.setItem("username", user.username);
        localStorage.setItem("role", user.role);
        sessionStorage.setItem("isLoggedIn", "true");

        Swal.fire("✅ เข้าสู่ระบบสำเร็จ!", "กำลังเปลี่ยนหน้า...", "success");
        
        // ✅ นำทางไปยัง Dashboard
        navigate("/dashboard");
      } else {
        Swal.fire("❌ ล็อกอินไม่สำเร็จ", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "error");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      Swal.fire("❌ เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsLoading(false);
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
      <div className="container flex">
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
                <span>🔄 กำลังเข้าสู่ระบบ...</span>
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
