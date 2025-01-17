import { useState } from "react";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./Mmu.scss";

const ManageUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john.doe@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", role: "Staff" },
    { id: 3, name: "Mark Johnson", email: "mark.johnson@example.com", role: "Customer" },
  ]);

  const handleAddUser = () => {
    alert("ฟังก์ชันเพิ่มผู้ใช้");
  };

  const handleEditUser = (user) => {
    alert(`แก้ไขข้อมูลของ ${user.name}`);
  };

  const handleDeleteUser = (userId) => {
    const confirmDelete = window.confirm("คุณต้องการลบผู้ใช้นี้หรือไม่?");
    if (confirmDelete) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  return (
    <div className="mmu-container">
      <Navbar />
      <Sidebar />
      <div className="mmu-content">
        <div className="mmuheader">
          <h1>จัดการบัญชีผู้ใช้</h1>
          <button className="add-user-button" onClick={handleAddUser}>
            เพิ่มผู้ใช้
          </button>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>อีเมล</th>
              <th>บทบาท</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEditUser(user)}
                  >
                    แก้ไข
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
