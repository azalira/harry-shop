import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useCart } from "../context/CartContext";
import StorageImage from "../components/StorageImage";
import { toast } from "sonner";
import { TextSkeleton } from "../components/Skeletons";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  const stockCount = Number(product?.stock) || 0;
  const isInStock = stockCount > 0;

  useEffect(() => {
    // Sécurité : Si l'ID dans l'URL est corrompu ou "undefined"
    if (!id || id === "undefined" || id.length < 10) {
      console.error("ID invalide détecté:", id);
      setLoading(false);
      return;
    }
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      setLoading(true);
      // On récupère toutes les colonnes pour identifier dynamiquement le vendeur
      const { data, error } = await supabase
        .from("products")
        .select(`*, profiles ( id, username )`)
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Erreur fetch:", error.message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  const handleBuyNow = async () => {
    if (!isInStock) {
      toast.error("Ce produit est en rupture de stock.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate("/login");

    // Détection dynamique de l'ID vendeur pour éviter l'erreur "seller_id null"
    const sellerId = product.user_id || product.seller_id || product.profiles?.id;

    if (!sellerId) {
      toast.error("Erreur : Impossible d'identifier le vendeur (colonne manquante dans la DB)");
      return;
    }

    setIsBuying(true);
    try {
      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert([{
          buyer_id: user.id,
          product_id: product.id,
          seller_id: sellerId,
          quantity: quantity,
          total_price: product.price * quantity,
          status: "en attente"
        }])
        .select()
        .single();

      if (error) throw error;

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: product.stock - quantity })
        .eq("id", product.id);

      if (stockError) console.error("Erreur mise à jour stock:", stockError);

      navigate("/payment", {
        state: {
          orderId: newOrder.id,
          totalPrice: product.price * quantity,
          product: product
        }
      });
    } catch (err) {
      toast.error("Erreur commande : " + err.message);
    } finally {
      setIsBuying(false);
    }
  };

  const handleAddToCart = () => {
    if (!isInStock) {
      toast.error("Ce produit est en rupture de stock.");
      return;
    }
    addToCart(product, quantity);
    toast.success(`${product.name} ajouté au panier`);
  };

  // --- GESTION DES ÉTATS D'AFFICHAGE (EMPECHE LE CRASH) ---

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="aspect-square bg-gray-100" />
          <div className="space-y-8">
            <TextSkeleton lines={2} />
            <div className="h-10 w-32 bg-gray-100" />
            <div className="space-y-4 pt-6">
              <div className="h-6 w-48 bg-gray-100" />
              <div className="h-14 bg-gray-100" />
              <div className="h-14 bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-32 text-center">
        <h2 className="text-2xl font-black uppercase mb-4">Produit introuvable</h2>
        <p className="text-gray-400 mb-8">L'ID du produit est invalide ou a été supprimé.</p>
        <button 
          onClick={() => navigate("/shop")}
          className="bg-black text-white px-8 py-3 font-black uppercase text-[10px] tracking-widest"
        >
          Retour au shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        
        {/* IMAGE */}
          <div className="bg-white aspect-square border border-gray-100 shadow-sm overflow-hidden rounded-xl">
          <StorageImage
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* INFOS */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
              {product.name}
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Vendeur : {product.profiles?.username || "Harry Shop"}
            </p>
          </div>

          <p className="text-4xl font-black italic">{product.price}€</p>
          
          <div className="flex flex-col gap-4 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-widest text-gray-500">Stock disponible</p>
              <p className={`text-sm font-black uppercase ${isInStock ? 'text-emerald-600' : 'text-red-600'}`}>
                {isInStock ? `${stockCount} articles` : 'Rupture de stock'}
              </p>
            </div>

            <button 
              onClick={handleAddToCart} 
              disabled={!isInStock}
              className={`w-full py-5 border-2 border-black font-black uppercase text-[11px] tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                !isInStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black hover:text-white'
              }`}
            >
              Ajouter au panier
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={isBuying || !isInStock}
              className={`w-full py-5 bg-black text-white font-black uppercase text-[11px] tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(255,100,0,1)] ${
                isBuying || !isInStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
              }`}
            >
              {isBuying ? "Traitement..." : isInStock ? "Acheter maintenant" : "Produit en rupture"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}