import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Components/Auth/ProtectedRoute"; // ✅ นำเข้า ProtectedRoute
import Dashboard from "./Components/Dashboard/Dashboard";
import Login from "./Components/Login/Login";
import Table from "./Components/Table/Table";
import Recipe from "./Components/Recipe/Recipe";
import Product from "./Components/Product/Product";
import AddProduct from "./Components/Addproduct/Addproduct";
import Inventory from "./Components/Inventory/Inventory";
import ProfileSettings from "./Components/ProfileSettings/ProfileSettings";
import Report from "./Components/Report/Report";
import ManageUsers from "./Components/Mmu/Mmu";
import StartTable from "./Components/Table/StartTable/Starttable";
import TableDetails from "./Components/Table/TableDetails/TableDetails";
import Addinventory from "./Components/Inventory/Addinventory/Addinventory";
import EditIngredient from "./Components/Inventory/EditIngredient/EditIngredient";
import Addrecipe from "./Components/Recipe/AddRecipe/Addrecipe";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 Route สำหรับหน้า Login */}
        <Route path="/" element={<Login />} />

        {/* 🔹 Route ที่ใช้ได้ทุก Role */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Product" element={<Product />} />
        <Route path="/ProfileSettings" element={<ProfileSettings />} />
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/addrecipe" element={<Addrecipe />} />

        {/* 🔥 Protected Route สำหรับเฉพาะ Admin เท่านั้น */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/ManageUsers" element={<ManageUsers />} />
        </Route>

        {/* 🔥 Protected Route สำหรับ Admin และ Staff */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
          <Route path="/Inventory" element={<Inventory />} />
          <Route path="/Addinventory" element={<Addinventory />} />
          <Route path="/edit-ingredient/:id" element={<EditIngredient />} />
          <Route path="/report" element={<Report />} />
          <Route path="/table" element={<Table />} />
          <Route path="/TableDetails/:tableId" element={<TableDetails />} />
          <Route path="/starttable/:tableId" element={<StartTable />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
