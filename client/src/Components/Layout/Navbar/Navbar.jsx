import "./Navbar.scss";
import { MdNotifications } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { MdArrowDropDown } from "react-icons/md";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("Guest"); // ค่าเริ่มต้น
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("username") || "Guest";
    const storedProfileImage = localStorage.getItem("profileImage"); // ✅ ดึงรูปจาก Local Storage
    setUsername(loggedInUser);
    if (storedProfileImage) {
      setProfileImage(storedProfileImage);
    }
  }, []);

  useEffect(() => {
    // ดึงข้อมูลชื่อผู้ใช้จาก Local Storage
    const loggedInUser = localStorage.getItem("username") || "Guest";
    setUsername(loggedInUser);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("username"); // ล้างข้อมูลผู้ใช้
    setUsername("Guest"); // รีเซ็ตเป็น Guest
    setIsDropdownOpen(false); // ปิด Dropdown
  };

  return (
    <div className="navbar-container">
      <div className="right-section">
        <MdNotifications size={24} className="icon" />
        <div className="user-dropdown" onClick={toggleDropdown}>
          <img
            src={`http://localhost:3002${profileImage}`} // ✅ โหลดจากเซิร์ฟเวอร์
            alt="Profile"
            className="profile-pic"
          />
          <span className="user-name">{username}</span> {/* แสดงชื่อผู้ใช้ */}
          <MdArrowDropDown size={24} className="icon" />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <a href="/ProfileSettings">ตั้งค่าโปรไฟล์</a>
              <a href="/ManageUsers">จัดการบัญชีผู้ใช้</a>
              <a href="/" onClick={handleLogout}>
                ออกจากระบบ
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
