import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./ProfileSettings.scss";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("My details");
  const [editMode, setEditMode] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await axios.post(
        `http://localhost:3002/api/users/upload-profile/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const newProfileImage = res.data.profileImageUrl;
      console.log("✅ รูปโปรไฟล์ที่อัปโหลด:", newProfileImage);

      // ✅ อัปเดต State
      setFormData((prev) => ({ ...prev, profileImage: newProfileImage }));

      // ✅ บันทึกลง Local Storage
      localStorage.setItem("profileImage", newProfileImage);

      Swal.fire("✅ อัปโหลดรูปสำเร็จ!", "", "success");
    } catch (error) {
      Swal.fire("❌ อัปโหลดรูปไม่สำเร็จ!", "", "error");
    }
  };

  useEffect(() => {
    const storedProfileImage = localStorage.getItem("profileImage");
    console.log("🔍 รูปที่โหลดจาก Local Storage:", storedProfileImage);
    if (storedProfileImage) {
      setFormData((prev) => ({ ...prev, profileImage: storedProfileImage }));
    }
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      Swal.fire("⚠️ กรุณาเข้าสู่ระบบ", "", "warning").then(() => navigate("/"));
      return;
    }
    setUserId(storedUserId);
    fetchProfile(storedUserId);
  }, [navigate]);

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:3002/api/users/profile/${id}`
      );
      console.log("📌 ข้อมูลโปรไฟล์ที่ได้จาก API:", res.data);

      setFormData({
        fullName: res.data.username || "",
        email: res.data.email || "",
        phone: res.data.phone_number || "",
        address: res.data.address || "",
        profileImage: res.data.profile_image || "", // ✅ เพิ่ม profileImage
      });

      // ✅ บันทึกลง Local Storage เพื่อให้โหลดได้ตอนรีเฟรช
      if (res.data.profile_image) {
        localStorage.setItem("profileImage", res.data.profile_image);
      }
    } catch (error) {
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDetails = async () => {
    try {
      await axios.put(
        `http://localhost:3002/api/users/profile/${userId}`,
        formData
      );
      Swal.fire("✅ บันทึกข้อมูลสำเร็จ!", "", "success");
      setEditMode(false);
    } catch (error) {
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      Swal.fire("❌ กรุณากรอกรหัสผ่านให้ครบถ้วน!", "", "error");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire("❌ รหัสผ่านใหม่ไม่ตรงกัน!", "", "error");
      return;
    }
    try {
      await axios.put(`http://localhost:3002/api/users/password/${userId}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      Swal.fire("✅ เปลี่ยนรหัสผ่านเรียบร้อย!", "", "success");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่สามารถเปลี่ยนรหัสผ่านได้", "error");
    }
  };

  return (
    <div className="profile-container">
      <Navbar />
      <Sidebar />
      <div className="profile-content">
        <div className="profile-header">
          <img
            className="profile-pic"
            src={
              formData.profileImage
                ? `http://localhost:3002${formData.profileImage}`
                : ""
            }
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />

          <div className="profile-info">
            <h1>ตั้งค่าโปรไฟล์</h1>
            <p>{formData.email}</p>
          </div>
        </div>
        <div className="nav-tabs">
          {["My details", "Password"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active-tab" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "My details" && (
          <div className="details-content">
            <h2>My Details</h2>
            <form>
              <div className="form-group">
                <label>Profile Picture</label>
                <input type="file" accept="image/*" onChange={handleUpload} />
              </div>

              {formData.profileImage && (
                <img
                  className="profile-pic"
                  src={`http://localhost:3002${formData.profileImage}`}
                  alt="Profile"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "8px",
                  }}
                />
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </div>
              <div className="buttons">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      className="save-button"
                      onClick={handleSaveDetails}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Details
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        {activeTab === "Password" && (
          <div className="details-content">
            <h2>Change Password</h2>
            <form>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="buttons">
                <button
                  type="button"
                  className="save-button"
                  onClick={handleChangePassword}
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfileSettings;
