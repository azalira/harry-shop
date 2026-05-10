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

  // Filtrage en temps réel
  useEffect(() => {
    const results = products.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Récupération parallèle pour plus de rapidité
      const [prodRes, profRes] = await Promise.all([
        supabase.from("products").select("*, profiles(username)"),
        supabase.from("profiles").select("role")
      ]);

      if (prodRes.error) throw prodRes.error;
      
      // LOG DE DEBUG : Si profRes.data est vide ou null, c'est un problème de RLS sur Supabase
      console.log("Données profils reçues :", profRes.data);

      const productsData = prodRes.data || [];
      const profiles = profRes.data || [];

      // 2. Calcul du Revenu (Prix total des produits en ligne)
      const revenue = productsData.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
      
      // 3. Filtrage flexible des rôles (Gère 'vendeur'/'seller' et 'client'/'buyer')
      const sellers = profiles.filter(p => 
        ['seller', 'vendeur'].includes(p.role?.toLowerCase())
      );
      const buyers = profiles.filter(p => 
        ['buyer', 'client', 'customer'].includes(p.role?.toLowerCase())
      );

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
      alert("Erreur lors de la récupération des données : " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    const confirm = window.confirm("🚨 SUPPRESSION DÉFINITIVE ?\nCette action est irréversible.");
    if (!confirm) return;

    try {
      // Vérification des dépendances (Orders)
      const { data: orders } = await supabase.from("orders").select("id").eq("product_id", id);
      
      if (orders && orders.length > 0) {
        alert("❌ Impossible : Ce produit est lié à des commandes.");
        return;
      }

      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      
      // Mise à jour de l'état local sans recharger toute la page
      setProducts(prev => prev.filter(p => p.id !== id));
      
    } catch (error) {
      alert("Erreur lors de la suppression : " + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-8 border-gray-200 border-t-red-600 rounded-full animate-spin mb-6"></div>
        <p className="font-black uppercase italic tracking-tighter text-xl">Accès à la base de données...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-12 font-sans text-gray-900 bg-white">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Admin <span className="text-red-600">Panel</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">Gestion centrale du système v1.0</p>
        </div>
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Chercher une référence..." 
            className="w-full border-4 border-black p-3 text-xs font-black uppercase outline-none shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] focus:shadow-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-black text-white p-6 shadow-2xl">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2 opacity-50 text-red-500">Volume Total</p>
          <p className="text-3xl font-black italic">{stats.totalRevenue} €</p>
        </div>
        
        <div className="bg-white border-4 border-black p-6">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2 text-gray-400">Vendeurs / Clients</p>
          <p className="text-3xl font-black">
            {stats.totalSellers} <span className="text-red-600 text-xl">/</span> {stats.totalBuyers}
          </p>
        </div>

        <div className="bg-white border-4 border-black p-6">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2 text-gray-400">Total Catalogue</p>
          <p className="text-3xl font-black">{products.length}</p>
        </div>

        <div className="bg-red-600 text-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2 opacity-80">Rupture Stock</p>
          <p className="text-3xl font-black">{products.filter(p => (p.stock || 0) <= 0).length}</p>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="overflow-x-auto border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white text-[11px] uppercase tracking-[0.2em]">
              <th className="p-5">Dispo</th>
              <th className="p-5">Nom du produit</th>
              <th className="p-5">Vendeur</th>
              <th className="p-5">Prix</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-black uppercase">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b-2 border-gray-100 hover:bg-red-50 transition-colors">
                <td className="p-5">
                  {(p.stock || 0) > 0 ? (
                    <span className="text-green-600 border-2 border-green-600 px-2 py-0.5">INSTOCK</span>
                  ) : (
                    <span className="text-red-600 border-2 border-red-600 px-2 py-0.5">EMPTY</span>
                  )}
                </td>
                <td className="p-5 text-sm">{p.name}</td>
                <td className="p-5 text-gray-400 italic">{p.profiles?.username || 'ANONYME'}</td>
                <td className="p-5 text-sm tabular-nums">{p.price?.toFixed(2)} €</td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => deleteProduct(p.id)}
                    className="bg-black text-white px-4 py-2 hover:bg-red-600 transition-all font-black"
                  >
                    DELETE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="p-20 text-center text-gray-300 font-black uppercase italic tracking-widest">
            Aucune donnée disponible dans le secteur.
          </div>
        )}
      </div>
    </div>
  );
}