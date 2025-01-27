import "./Navbar.scss";
<<<<<<< HEAD
import { MdNotifications, MdArrowDropDown } from "react-icons/md";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Api/axios";
=======
import { MdNotifications } from "react-icons/md";
import { MdArrowDropDown } from "react-icons/md";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a

const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [profileImage, setProfileImage] = useState("");
<<<<<<< HEAD
  const [role, setRole] = useState(""); 
=======
  const [role, setRole] = useState(""); // 🔥 เพิ่ม state สำหรับ role
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedUsername = localStorage.getItem("username");
    const storedProfileImage = localStorage.getItem("profileImage");
<<<<<<< HEAD
    const storedRole = localStorage.getItem("role"); 

    if (storedUsername) setUsername(storedUsername);
    if (storedProfileImage) setProfileImage(storedProfileImage);
    if (storedRole) setRole(storedRole); 
=======
    const storedRole = localStorage.getItem("role"); // ✅ ดึง role จาก Local Storage

    if (storedUsername) setUsername(storedUsername);
    if (storedProfileImage) setProfileImage(storedProfileImage);
    if (storedRole) setRole(storedRole); // ✅ อัปเดต role
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a

    if (storedUserId) {
      fetchUserProfile(storedUserId);
    }
  }, []);

<<<<<<< HEAD
  // ✅ ใช้ useEffect ติดตามการเปลี่ยนแปลงของ profileImage และ LocalStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedProfileImage = localStorage.getItem("profileImage");
      if (updatedProfileImage) {
        setProfileImage(updatedProfileImage);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ✅ เมื่อ profileImage อัปเดต ให้ใช้ useEffect เพื่ออัปเดต Navbar ทันที
  useEffect(() => {
    const storedProfileImage = localStorage.getItem("profileImage");
    if (storedProfileImage) {
      setProfileImage(storedProfileImage);
    }
  }, [profileImage]);

  const fetchUserProfile = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:3002/api/users/profile/${userId}`
      );
      setUsername(res.data.username);
      setProfileImage(res.data.profile_image);
      setRole(res.data.role);

      // 📌 อัปเดต Local Storage ทันที
=======
  const fetchUserProfile = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:3002/api/users/profile/${userId}`);
      setUsername(res.data.username);
      setProfileImage(res.data.profile_image);
      setRole(res.data.role); // ✅ โหลด role จาก API

      // 📌 อัปเดต Local Storage
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
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
<<<<<<< HEAD
    setProfileImage("");
    setRole("");
=======
    setProfileImage(""); 
    setRole(""); // ✅ รีเซ็ต role
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
    navigate("/");
  };

  // ✅ ตรวจสอบ URL ของรูปโปรไฟล์ก่อนแสดง
  const formattedProfileImage = profileImage?.startsWith("http")
    ? profileImage
    : `http://localhost:3002${profileImage}`;

  return (
    <div className="navbar-container">
      <div className="right-section">
        <MdNotifications size={24} className="icon" />
        <div className="user-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <img
<<<<<<< HEAD
            src={formattedProfileImage ? formattedProfileImage : "/default-avatar.png"}
=======
            src={profileImage ? `http://localhost:3002${profileImage}` : "/default-avatar.png"}
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
            alt="Profile"
            className="profile-pic"
          />
          <span className="user-name">{username}</span>
          <MdArrowDropDown size={24} className="icon" />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <a href="/ProfileSettings">ตั้งค่าโปรไฟล์</a>
<<<<<<< HEAD
              {role === "admin" && <a href="/ManageUsers">จัดการบัญชีผู้ใช้</a>}
=======
              {role === "admin" && <a href="/ManageUsers">จัดการบัญชีผู้ใช้</a>} {/* 🔥 ซ่อนถ้าไม่ใช่ Admin */}
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
              <a href="/" onClick={handleLogout}>ออกจากระบบ</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
