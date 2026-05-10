import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalSellers: 0,
    totalBuyers: 0,
    totalRevenue: 0,
    mostSoldProduct: "N/A"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const results = products.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [prodRes, profRes] = await Promise.all([
        supabase.from("products").select("*, profiles(username)"),
        supabase.from("profiles").select("role")
      ]);

      if (prodRes.error) throw prodRes.error;

      const productsData = prodRes.data || [];
      const profiles = profRes.data || [];

      const revenue = productsData.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
      
      const sellers = profiles.filter(p => ['seller', 'vendeur'].includes(p.role?.toLowerCase()));
      const buyers = profiles.filter(p => ['buyer', 'client', 'customer'].includes(p.role?.toLowerCase()));

      setProducts(productsData);
      setFilteredProducts(productsData);
      
      setStats({
        totalSellers: sellers.length,
        totalBuyers: buyers.length,
        totalRevenue: revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
        mostSoldProduct: productsData[0]?.name || "Aucun"
      });

    } catch (error) {
      console.error("Erreur Dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    const confirm = window.confirm("🚨 SUPPRESSION DÉFINITIVE ?");
    if (!confirm) return;

    try {
      const { data: orders } = await supabase.from("orders").select("id").eq("product_id", id);
      if (orders && orders.length > 0) {
        alert("❌ Impossible : Ce produit est lié à des commandes.");
        return;
      }
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="font-black uppercase italic tracking-tighter">Accès sécurisé...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-12 font-sans text-gray-900 bg-white">
      {/* HEADER RESPONSIVE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
            Admin <span className="text-red-600">Panel</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">v1.0.4 - Système de gestion</p>
        </div>
        <div className="w-full md:w-80">
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full border-4 border-black p-3 text-xs font-black uppercase outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* STATS GRID RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        <div className="bg-black text-white p-6 shadow-xl">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-50">Revenue Brut</p>
          <p className="text-2xl md:text-3xl font-black italic">{stats.totalRevenue} €</p>
        </div>
        
        <div className="bg-white border-4 border-black p-6">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1 text-gray-400">Users (V/C)</p>
          <p className="text-2xl md:text-3xl font-black">{stats.totalSellers} / {stats.totalBuyers}</p>
        </div>

        <div className="bg-white border-4 border-black p-6">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1 text-gray-400">Articles</p>
          <p className="text-2xl md:text-3xl font-black">{products.length}</p>
        </div>

        <div className="bg-red-600 text-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-80">Stock Alerte</p>
          <p className="text-2xl md:text-3xl font-black">{products.filter(p => (p.stock || 0) <= 0).length}</p>
        </div>
      </div>

      {/* TABLEAU AVEC OVERFLOW POUR MOBILE */}
      <div className="w-full overflow-x-auto border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-black text-white text-[10px] uppercase tracking-widest">
              <th className="p-4">Status</th>
              <th className="p-4">Désignation</th>
              <th className="p-4">Propriétaire</th>
              <th className="p-4">Prix</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-black uppercase">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b-2 border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  {(p.stock || 0) > 0 ? (
                    <span className="text-green-600 font-bold tracking-tighter">● EN LIGNE</span>
                  ) : (
                    <span className="text-red-600 font-bold tracking-tighter">○ RUPTURE</span>
                  )}
                </td>
                <td className="p-4 text-sm truncate max-w-[200px]">{p.name}</td>
                <td className="p-4 text-gray-400">{p.profiles?.username || 'System'}</td>
                <td className="p-4 text-sm">{p.price?.toFixed(2)} €</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => deleteProduct(p.id)}
                    className="bg-black text-white px-3 py-2 text-[9px] hover:bg-red-600 transition-colors font-black"
                  >
                    SUPPRIMER
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="p-20 text-center font-black uppercase italic text-gray-300 tracking-widest">
            Aucune correspondance trouvée
          </div>
        )}
      </div>
    </div>
  );
}