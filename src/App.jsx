import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Register from "./pages/Register";
import AddProduct from "./pages/Addproduct";
import Login from "./pages/Login";
import SellerDashboard from "./pages/SellerDashboard";
import EditProduct from "./pages/EditProduct";
import SellerOrders from "./pages/SellerOrders";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";
import MyOrders from "./pages/MyOrders";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Breadcrumbs />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment" element={<Payment />} />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute roles={["vendeur", "admin"]}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["vendeur"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute roles={["vendeur", "admin"]}>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-orders"
          element={
            <ProtectedRoute roles={["vendeur"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;