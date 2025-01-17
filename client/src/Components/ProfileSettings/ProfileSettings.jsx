import { useState } from "react";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./ProfileSettings.scss";

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("My details");
  const [details, setDetails] = useState({
    fullName: "Jenny Doe",
    email: "jenny@untitledui.com",
    phone: "0987654321",
    dob: "1990-01-01",
    address: "123 Example Street, City, Country",
  });

  const [formData, setFormData] = useState({
    ...details,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    currentEmail: details.email,
    newEmail: "",
    confirmEmail: "",
  });

  const [editMode, setEditMode] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setEditMode(false); // ปิดโหมดแก้ไขเมื่อเปลี่ยนแท็บ
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDetails = () => {
    setDetails({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      address: formData.address,
    });
    setEditMode(false);
    alert("ข้อมูลถูกบันทึกเรียบร้อยแล้ว!");
  };

  const handleCancelEdit = () => {
    setFormData((prev) => ({
      ...prev,
      ...details,
    }));
    setEditMode(false);
  };

  const handleSavePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน!");
      return;
    }
    alert("รหัสผ่านเปลี่ยนแปลงเรียบร้อยแล้ว!");
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleSaveEmail = () => {
    if (formData.newEmail !== formData.confirmEmail) {
      alert("อีเมลใหม่และยืนยันอีเมลไม่ตรงกัน!");
      return;
    }
    setDetails((prev) => ({
      ...prev,
      email: formData.newEmail,
    }));
    alert("อีเมลเปลี่ยนแปลงเรียบร้อยแล้ว!");
    setFormData((prev) => ({
      ...prev,
      currentEmail: formData.newEmail,
      newEmail: "",
      confirmEmail: "",
    }));
  };

  return (
    <div className="profile-container">
      <Navbar />
      <Sidebar />
      <div className="profile-content">
        <div className="profile-header">
          <img
            className="profile-pic"
            src="https://picsum.photos/100"
            alt="Profile"
          />
          <div className="profile-info">
            <h1>ตั้งค่าโปรไฟล์</h1>
            <p>{details.email}</p>
          </div>
        </div>
        <div className="nav-tabs">
          {["My details", "Password", "Email"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active-tab" : ""}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* My Details */}
        {activeTab === "My details" && (
          <div className="details-content">
            <h2>My Details</h2>
            <form>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
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
                      onClick={handleCancelEdit}
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

        {/* Password Tab */}
        {activeTab === "Password" && (
          <div className="settings-content">
            <h2>Password</h2>
            <form>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <button
                type="button"
                className="save-button"
                onClick={handleSavePassword}
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === "Email" && (
          <div className="settings-content">
            <h2>Email</h2>
            <form>
              <div className="form-group">
                <label>Current Email</label>
                <input
                  type="email"
                  name="currentEmail"
                  value={formData.currentEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>New Email</label>
                <input
                  type="email"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Confirm Email</label>
                <input
                  type="email"
                  name="confirmEmail"
                  value={formData.confirmEmail}
                  onChange={handleChange}
                />
              </div>
              <button
                type="button"
                className="save-button"
                onClick={handleSaveEmail}
              >
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
