import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./Auth/ProtectedRoute"; 

// ✅ Lazy Load Pages เพื่อลดขนาด Bundle
const Dashboard = lazy(() => import("./Components/pages/Dashboard/Dashboard"));
const Login = lazy(() => import("./Components/pages/Login"));
const Tables = lazy(() => import("./Components/pages/Table/Table"));
const Recipe = lazy(() => import("./Components/pages/Recipe/Recipe"));
const Product = lazy(() => import("./Components/pages/Menu/Menu"));
const Addproduct = lazy(() => import("./Components/Product/Addproduct"));
const Inventory = lazy(() => import("./Components/pages/Inventory/Inventory"));
const ProfileSettings = lazy(() => import("./Components/pages/Profile/ProfileSettings"));
const Report = lazy(() => import("./Components/pages/Report/Report"));
const ManageUsers = lazy(() => import("./Components/pages/Mmu/Mmu"));
const StartTable = lazy(() => import("./Components/pages/Table/StartTable/Starttable"));
const TableDetails = lazy(() => import("./Components/pages/Table/TableDetails/TableDetails"));
const Addinventory = lazy(() => import("./Components/pages/Inventory/Addinventory/Addinventory"));
const EditIngredient = lazy(() => import("./Components/pages/Inventory/EditIngredient/EditIngredient"));
const Addrecipe = lazy(() => import("./Components/pages/Recipe/AddRecipe/Addrecipe"));
const OrderPage = lazy(() => import("./Components/pages/Orderpage/Orderpage"));
const EditTable = lazy(() => import("./Components/pages/Table/EditTable/EditTable"));
const NotFound = lazy(() => import("./Components/pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* ✅ Route สำหรับ Login */}
          <Route path="/" element={<Login />} />

          {/* ✅ Routes สำหรับทุกคน */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product" element={<Product />} />
          <Route path="/profilesettings" element={<ProfileSettings />} />
          <Route path="/recipe" element={<Recipe />} />
          <Route path="/addrecipe" element={<Addrecipe />} />

          {/* ✅ Protected Routes for Admin Only */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/addproduct" element={<Addproduct />} />
          </Route>

          {/* ✅ Protected Routes for Admin and Staff */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/addinventory" element={<Addinventory />} />
            <Route path="/edit-ingredient/:id" element={<EditIngredient />} />
            <Route path="/report" element={<Report />} />
            <Route path="/table" element={<Tables />} />
            <Route path="/edit-table/:id" element={<EditTable />} />
            <Route path="/table-details/:tableId" element={<TableDetails />} />
            <Route path="/start-table/:tableId" element={<StartTable />} />
          </Route>

          {/* ✅ Route สำหรับสั่งอาหาร */}
          <Route path="/order/:table_id" element={<OrderPage />} />

          {/* ✅ Route 404 สำหรับหน้าที่ไม่มีอยู่ */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
