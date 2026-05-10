import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../services/supabaseClient";
import StorageImage from "../components/StorageImage";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  // 1. On récupère les données du state avec une sécurité (objet vide par défaut)
  const { orderId, totalPrice, product, cartItems } = location.state || {};

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId && (!Array.isArray(cartItems) || cartItems.length === 0)) {
      console.error("Erreur : orderId et cartItems sont manquants. Redirection...");
      // Optionnel : décommente la ligne suivante pour rediriger automatiquement
      // navigate("/shop");
    }
  }, [orderId, cartItems, navigate]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous connecter pour finaliser le paiement.");

      if (orderId) {
        const { error } = await supabase
          .from("orders")
          .update({ status: "payé" })
          .eq("id", orderId);

        if (error) throw error;
      } else if (Array.isArray(cartItems) && cartItems.length > 0) {
        const ordersToInsert = cartItems.map((item) => ({
          buyer_id: user.id,
          product_id: item.id,
          seller_id: item.seller_id || item.user_id || item.profiles?.id || null,
          quantity: item.quantity,
          total_price: Number(item.price) * Number(item.quantity),
          status: "payé"
        }));

        const { error } = await supabase.from("orders").insert(ordersToInsert);
        if (error) throw error;
        clearCart();
      } else {
        throw new Error("Aucune commande valide à payer.");
      }

      alert("Paiement réussi !");
      navigate("/shop");
    } catch (err) {
      alert("Erreur lors du paiement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isCartCheckout = Array.isArray(cartItems) && cartItems.length > 0;
  const displayOrderId = orderId ? `${orderId.slice(0, 18)}...` : "PANIER";

  // 3. AFFICHAGE DE SÉCURITÉ : Si les données sont corrompues
  if (!orderId && !isCartCheckout) {
    return (
      <div className="max-w-[800px] mx-auto p-20 text-center">
        <h2 className="text-2xl font-black uppercase mb-4 text-red-600">Session expirée</h2>
        <p className="text-gray-500 mb-8">Les informations de paiement sont introuvables. Veuillez recommencer l'achat.</p>
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
    <div className="max-w-[800px] mx-auto p-10 text-center">
      <h1 className="text-5xl font-black uppercase mb-10 italic tracking-tighter">Paiement</h1>
      
      <div className="border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
        <div className="flex justify-between items-start mb-8 border-b-2 border-gray-100 pb-6">
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commande n°</p>
            <p className="font-black text-xs">{displayOrderId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Montant Total</p>
            <p className="font-black text-3xl text-orange-600">{totalPrice}€</p>
          </div>
        </div>

        {isCartCheckout ? (
          <div className="space-y-4 mb-10 text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Articles dans le panier</p>
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <StorageImage
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                  fallback="https://via.placeholder.com/80"
                />
                <div>
                  <p className="font-black uppercase text-sm">{item.name}</p>
                  <p className="text-[10px] text-gray-500">Quantité: {item.quantity}</p>
                  <p className="text-[10px] text-gray-500">Prix unitaire: {item.price}€</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-6 items-center mb-10 bg-gray-50 p-4">
            <StorageImage src={product.image_url} alt={product?.name || "Produit"} className="w-20 h-20 object-cover border-2 border-black" />
            <div className="text-left">
              <p className="font-black uppercase text-sm">{product?.name || "Produit"}</p>
              <p className="text-[10px] font-bold text-gray-500 italic">Prêt pour expédition</p>
            </div>
          </div>
        )}

        <button 
          onClick={handleConfirmPayment}
          disabled={loading}
          className={`w-full py-6 bg-black text-white font-black uppercase text-xs tracking-[0.3em] transition-all ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
          }`}
        >
          {loading ? "Vérification..." : "Confirmer et Payer"}
        </button>
      </div>
    </div>
  );
}
