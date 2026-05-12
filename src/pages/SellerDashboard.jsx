import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import StorageImage from '../components/StorageImage';
import { toast } from 'sonner';

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Définition de la fonction de récupération des données
  const fetchSellerData = async () => {
    try {
      setLoading(true);
      // Récupérer l'ID de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Veuillez vous connecter");
        return;
      }

      // On récupère uniquement les produits de ce vendeur
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erreur fetch:", error.message);
      toast.error("Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer cet article ?");

    if (!confirmDelete) return;

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id", { count: "exact" })
      .eq("product_id", productId)
      .limit(1);

    if (orderError) {
      toast.error("Erreur de vérification des commandes : " + orderError.message);
      return;
    }

    if (orderData?.length > 0) {
      toast.error("Impossible de supprimer ce produit : il est déjà associé à une commande.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("seller_id", user.id);

    if (error) {
      toast.error("Erreur lors de la suppression : " + error.message);
    } else {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

  const SkeletonCard = () => (
    <div className="relative overflow-hidden flex items-center justify-between p-6 border border-gray-100 bg-white rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer -translate-x-full"></div>
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-gray-100"></div>
        <div className="flex flex-col gap-2">
          <div className="h-5 w-48 bg-gray-100"></div>
          <div className="h-7 w-20 bg-gray-50"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto mt-10 px-6">
      <div className="flex justify-between items-end border-b pb-8 border-gray-100">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Dashboard</h1>
        <Link to="/add-product" className="bg-black text-white px-8 py-4 font-bold text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-all">
          + Ajouter
        </Link>
      </div>

      <div className="mt-12 space-y-4">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-6 border border-gray-100 bg-white hover:shadow-md transition-all rounded-xl">
              <div className="flex items-center gap-6">
                <StorageImage
                  src={product.image_url}
                  alt={product.name}
                  className="w-20 h-20 object-cover bg-gray-50"
                  fallback="https://via.placeholder.com/80"
                />
                <div>
                  <h4 className="font-bold text-lg uppercase">{product.name}</h4>
                  <p className="text-orange-500 font-black text-xl">{product.price}€</p>
                </div>
              </div>
              <div className="flex gap-6">
                <Link 
                  to={`/edit-product/${product.id}`} 
                  className="text-[11px] font-bold uppercase text-gray-400 hover:text-black transition"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-[11px] font-bold uppercase text-red-300 hover:text-red-600 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 text-gray-400 uppercase text-xs font-bold tracking-widest rounded-xl">
            Aucun produit trouvé
          </div>
        )}
      </div>
    </div>
  );
}