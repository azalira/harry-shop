import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Register from "./pages/Register"; // 1. AJOUTEZ CET IMPORT
import AddProduct from "./pages/Addproduct";
import Login from "./pages/Login";
import SellerDashboard from "./pages/SellerDashboard"; 
import EditProduct from "./pages/EditProduct"; 
import SellerOrders from "./pages/SellerOrders";
import Payment from "./pages/Payment";
import ProductCard from "./components/ProductCard";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<SellerDashboard />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/seller-orders" element={<SellerOrders />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;