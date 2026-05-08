import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  // 1. Vérifier si l'utilisateur est connecté
  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
    } else {
      setUser(user);
      fetchUserProducts(user.id);
    }
  }

  // 2. Récupérer uniquement les produits du vendeur connecté
  async function fetchUserProducts(userId) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur:", error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }

  // 3. Fonction de suppression
  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer cet article ?");
    
    if (confirmDelete) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        alert("Erreur lors de la suppression : " + error.message);
      } else {
        // Mise à jour locale de la liste pour éviter de recharger la page
        setProducts(products.filter((p) => p.id !== productId));
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen font-black uppercase tracking-widest">
      Chargement du dashboard...
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto px-6 py-16">
      {/* HEADER DASHBOARD */}
      <div className="flex justify-between items-center mb-12 border-b pb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Tableau de bord</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">
            Connecté en tant que : {user?.email}
          </p>
        </div>
        <Link 
          to="/add-product" 
          className="bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg"
        >
          Ajouter un article
        </Link>
      </div>

      {/* LISTE DES PRODUITS */}
      <div className="space-y-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="flex items-center justify-between bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              
              <div className="flex items-center gap-6">
                {/* APERÇU IMAGE */}
                <div className="w-20 h-20 bg-gray-50 border border-gray-100 overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                  />
                </div>

                {/* INFOS TEXTE */}
                <div>
                  <h3 className="font-black uppercase text-sm tracking-tight">{product.name}</h3>
                  <p className="text-orange-500 font-black text-lg">{product.price}€</p>
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Stock: {product.stock}</p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-6 items-center">
                <Link 
                  to={`/edit-product/${product.id}`} 
                  className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest border-b border-transparent hover:border-black pb-1"
                >
                  Modifier
                </Link>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="text-[10px] font-bold text-red-300 hover:text-red-600 transition-colors uppercase tracking-widest border-b border-transparent hover:border-red-600 pb-1"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Aucun produit en vente pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}