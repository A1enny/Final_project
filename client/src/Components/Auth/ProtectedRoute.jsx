import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem("role"); // ✅ ดึง role จาก Local Storage

  if (!userRole) {
    return <Navigate to="/" replace />; // 🔥 ถ้าไม่มี role ให้กลับไปที่หน้า Login
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />; // 🔥 ถ้าไม่มีสิทธิ์ให้กลับไปที่ Dashboard
  }

  return <Outlet />; // ✅ ถ้ามีสิทธิ์ให้เข้า Route ได้ปกติ
};

export default ProtectedRoute;
