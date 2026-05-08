import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSellers: 0,
    totalBuyers: 0,
    bestSeller: "N/A",
    topBuyer: "N/A",
    mostSoldProduct: "N/A"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    
    // 1. Récupérer les produits et vendeurs
    const { data: productsData } = await supabase
      .from("products")
      .select("*, profiles(username)");
    setProducts(productsData || []);

    // 2. Compter le nombre de vendeurs uniques (ceux qui ont posté un produit)
    const { data: sellers } = await supabase.from("profiles").select("id").eq("role", "seller"); 
    // Note: Adapte le filtre .eq("role", "seller") selon ta structure de table
    
    // 3. Calculer les statistiques (Logique simplifiée pour l'exemple)
    // Dans un vrai projet, ces calculs se font souvent via des fonctions RPC sur Supabase
    // pour de meilleures performances.
    
    const { data: profiles } = await supabase.from("profiles").select("username, role");
    
    setStats({
      totalSellers: profiles?.filter(p => p.role === 'seller').length || 0,
      totalBuyers: profiles?.filter(p => p.role === 'buyer').length || 0,
      bestSeller: "Harry", // Exemple statique ou calculé via une table 'sales'
      topBuyer: "Julie",   // Exemple statique
      mostSoldProduct: productsData?.[0]?.name || "Aucun"
    });

    setLoading(false);
  }

  async function deleteProduct(id) {
    const confirm = window.confirm("Supprimer définitivement ce produit ?");
    if (confirm) {
      await supabase.from("products").delete().eq("id", id);
      fetchDashboardData();
    }
  }

  if (loading) return <div className="p-10 text-center font-black animate-pulse">CHARGEMENT DES DONNÉES...</div>;

  return (
    <div className="max-w-[1200px] mx-auto p-10 font-sans">
      <h1 className="text-5xl font-black uppercase mb-10 italic tracking-tighter">
        Analytics <span className="text-red-600">Panel</span>
      </h1>

      {/* --- GRILLE DE STATISTIQUES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-black text-white p-6 border-l-8 border-red-600 shadow-2xl">
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Utilisateurs</p>
          <div className="flex justify-between items-end mt-2">
            <div>
              <span className="text-3xl font-black">{stats.totalSellers}</span>
              <span className="text-[10px] ml-2 opacity-50">VENDEURS</span>
            </div>
            <div>
              <span className="text-3xl font-black">{stats.totalBuyers}</span>
              <span className="text-[10px] ml-2 opacity-50">ACHETEURS</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 shadow-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Performances</p>
          <div className="mt-2">
            <p className="text-xs font-bold">TOP VENDEUR: <span className="text-red-600 uppercase">{stats.bestSeller}</span></p>
            <p className="text-xs font-bold">TOP ACHETEUR: <span className="text-red-600 uppercase">{stats.topBuyer}</span></p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 shadow-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Produit Phare</p>
          <p className="text-xl font-black mt-2 uppercase truncate">{stats.mostSoldProduct}</p>
        </div>
      </div>

      {/* --- TABLEAU DES PRODUITS --- */}
      <div className="bg-white border border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-4 bg-black text-white flex justify-between items-center">
          <h2 className="font-black uppercase text-sm tracking-widest">Inventaire Global</h2>
          <span className="text-[10px]">{products.length} ARTICLES</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-[10px] tracking-widest uppercase font-black bg-gray-50">
              <th className="p-4">Produit</th>
              <th className="p-4">Vendeur</th>
              <th className="p-4">Prix</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold uppercase">
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-red-50 transition-colors">
                <td className="p-4">{p.name}</td>
                <td className="p-4 text-gray-500">{p.profiles?.username || 'Anonyme'}</td>
                <td className="p-4 italic text-lg">{p.price}€</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => deleteProduct(p.id)} 
                    className="bg-black text-white px-3 py-1 hover:bg-red-600 transition-all uppercase text-[9px]"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}