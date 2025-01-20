import "./Navbar.scss";
import { MdNotifications } from "react-icons/md";
import { MdArrowDropDown } from "react-icons/md";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../Api/axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [profileImage, setProfileImage] = useState("");
  const [role, setRole] = useState(""); // 🔥 เพิ่ม state สำหรับ role

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedUsername = localStorage.getItem("username");
    const storedProfileImage = localStorage.getItem("profileImage");
    const storedRole = localStorage.getItem("role"); // ✅ ดึง role จาก Local Storage

    if (storedUsername) setUsername(storedUsername);
    if (storedProfileImage) setProfileImage(storedProfileImage);
    if (storedRole) setRole(storedRole); // ✅ อัปเดต role

    if (storedUserId) {
      fetchUserProfile(storedUserId);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const res = await axios.get(`http://localhost/api/users/profile/${userId}`);
      setUsername(res.data.username);
      setProfileImage(res.data.profile_image);
      setRole(res.data.role); // ✅ โหลด role จาก API

      // 📌 อัปเดต Local Storage
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("profileImage", res.data.profile_image);
      localStorage.setItem("role", res.data.role);
    } catch (error) {
      console.error("❌ โหลดข้อมูลผู้ใช้ไม่สำเร็จ:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsername("Guest");
    setProfileImage(""); 
    setRole(""); // ✅ รีเซ็ต role
    navigate("/");
  };

  return (
    <div className="navbar-container">
      <div className="right-section">
        <MdNotifications size={24} className="icon" />
        <div className="user-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <img
            src={profileImage ? `http://localhost${profileImage}` : "/default-avatar.png"}
            alt="Profile"
            className="profile-pic"
          />
          <span className="user-name">{username}</span>
          <MdArrowDropDown size={24} className="icon" />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <a href="/ProfileSettings">ตั้งค่าโปรไฟล์</a>
              {role === "admin" && <a href="/ManageUsers">จัดการบัญชีผู้ใช้</a>} {/* 🔥 ซ่อนถ้าไม่ใช่ Admin */}
              <a href="/" onClick={handleLogout}>ออกจากระบบ</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
