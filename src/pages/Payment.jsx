import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../services/supabaseClient";
import StorageImage from "../components/StorageImage";
import { toast } from "sonner";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const { orderId, totalPrice, product, cartItems } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardErrors, setCardErrors] = useState({});
  const [delivery, setDelivery] = useState({
    address: "",
    city: "",
    zip: "",
    country: "France"
  });

  useEffect(() => {
    if (!orderId && (!Array.isArray(cartItems) || cartItems.length === 0)) {
      console.error("Erreur : orderId et cartItems sont manquants.");
    }
  }, [orderId, cartItems, navigate]);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleCardChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    if (cardErrors.card) setCardErrors((prev) => ({ ...prev, card: "" }));
  };

  const validate = () => {
    const errors = {};
    const rawCard = cardNumber.replace(/\s/g, "");

    if (rawCard.length < 16) {
      errors.card = "Le numéro de carte doit contenir 16 chiffres.";
    }
    if (!delivery.address.trim()) {
      errors.address = "L'adresse de livraison est requise.";
    }
    if (!delivery.city.trim()) {
      errors.city = "La ville est requise.";
    }
    if (!delivery.zip.trim()) {
      errors.zip = "Le code postal est requis.";
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmPayment = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous connecter pour finaliser le paiement.");

      const lastFour = cardNumber.replace(/\s/g, "").slice(-4);
      const deliveryInfo = `${delivery.address}, ${delivery.zip} ${delivery.city}, ${delivery.country}`;

      if (orderId) {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .update({
            status: "payé",
            card_last_four: lastFour,
            delivery_address: deliveryInfo
          })
          .eq("id", orderId)
          .select("product_id, quantity")
          .single();

        if (orderError) throw orderError;

        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", order.product_id)
          .single();

        if (product) {
          await supabase
            .from("products")
            .update({ stock: product.stock - order.quantity })
            .eq("id", order.product_id);
        }
      } else if (Array.isArray(cartItems) && cartItems.length > 0) {
        const ordersToInsert = cartItems.map((item) => {
          if (!item.seller_id && !item.user_id) {
            throw new Error(`seller_id manquant pour le produit "${item.name}"`);
          }
          return {
            buyer_id: user.id,
            product_id: item.id,
            seller_id: item.seller_id || item.user_id || item.profiles?.id,
            quantity: item.quantity,
            total_price: Number(item.price) * Number(item.quantity),
            status: "payé",
            card_last_four: lastFour,
            delivery_address: deliveryInfo
          };
        });

        const { error } = await supabase.from("orders").insert(ordersToInsert);
        if (error) throw error;

        for (const item of cartItems) {
          const { data: product } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.id)
            .single();

          if (product) {
            await supabase
              .from("products")
              .update({ stock: product.stock - item.quantity })
              .eq("id", item.id);
          }
        }

        clearCart();
      } else {
        throw new Error("Aucune commande valide à payer.");
      }

      toast.success("Paiement réussi !");
      navigate("/shop");
    } catch (err) {
      toast.error("Erreur lors du paiement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isCartCheckout = Array.isArray(cartItems) && cartItems.length > 0;
  const displayOrderId = orderId ? `${orderId.slice(0, 18)}...` : "PANIER";

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
      
      <div className="border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white rounded-xl">
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
          <div className="flex gap-6 items-center mb-10 bg-gray-50 p-4 rounded-lg">
            <StorageImage src={product.image_url} alt={product?.name || "Produit"} className="w-20 h-20 object-cover border-2 border-black" />
            <div className="text-left">
              <p className="font-black uppercase text-sm">{product?.name || "Produit"}</p>
              <p className="text-[10px] font-bold text-gray-500 italic">Prêt pour expédition</p>
            </div>
          </div>
        )}

        {/* CARTE BANCAIRE */}
        <div className="border-t-2 border-gray-100 pt-8 mt-8 text-left">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Carte Bancaire
          </p>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
              Numéro de carte
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardChange}
              maxLength={19}
              className={`w-full border-2 px-4 py-3 text-sm font-mono tracking-widest outline-none transition-colors ${
                cardErrors.card ? "border-red-500 bg-red-50" : "border-black focus:bg-gray-100"
              }`}
            />
            {cardErrors.card && (
              <p className="text-red-500 text-[10px] font-bold mt-1">{cardErrors.card}</p>
            )}
            <p className="text-[9px] text-gray-400 mt-1 italic">
              Paiement sécurisé — seule la date d'expiration est requise.
            </p>
          </div>
        </div>

        {/* ADRESSE DE LIVRAISON */}
        <div className="border-t-2 border-gray-100 pt-8 mt-8 text-left">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Adresse de livraison
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Rue / Adresse
              </label>
              <input
                type="text"
                placeholder="12 rue des Lilas"
                value={delivery.address}
                onChange={(e) => {
                  setDelivery({ ...delivery, address: e.target.value });
                  if (cardErrors.address) setCardErrors((prev) => ({ ...prev, address: "" }));
                }}
                className={`w-full border-2 px-4 py-3 text-sm outline-none transition-colors ${
                  cardErrors.address ? "border-red-500 bg-red-50" : "border-black focus:bg-gray-100"
                }`}
              />
              {cardErrors.address && (
                <p className="text-red-500 text-[10px] font-bold mt-1">{cardErrors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  placeholder="75001"
                  value={delivery.zip}
                  onChange={(e) => {
                    setDelivery({ ...delivery, zip: e.target.value });
                    if (cardErrors.zip) setCardErrors((prev) => ({ ...prev, zip: "" }));
                  }}
                  className={`w-full border-2 px-4 py-3 text-sm outline-none transition-colors ${
                    cardErrors.zip ? "border-red-500 bg-red-50" : "border-black focus:bg-gray-100"
                  }`}
                />
                {cardErrors.zip && (
                  <p className="text-red-500 text-[10px] font-bold mt-1">{cardErrors.zip}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  placeholder="Paris"
                  value={delivery.city}
                  onChange={(e) => {
                    setDelivery({ ...delivery, city: e.target.value });
                    if (cardErrors.city) setCardErrors((prev) => ({ ...prev, city: "" }));
                  }}
                  className={`w-full border-2 px-4 py-3 text-sm outline-none transition-colors ${
                    cardErrors.city ? "border-red-500 bg-red-50" : "border-black focus:bg-gray-100"
                  }`}
                />
                {cardErrors.city && (
                  <p className="text-red-500 text-[10px] font-bold mt-1">{cardErrors.city}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Pays
              </label>
              <input
                type="text"
                placeholder="France"
                value={delivery.country}
                onChange={(e) => setDelivery({ ...delivery, country: e.target.value })}
                className="w-full border-2 border-black px-4 py-3 text-sm outline-none focus:bg-gray-100 transition-colors"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleConfirmPayment}
          disabled={loading}
          className={`w-full py-6 mt-8 bg-black text-white font-black uppercase text-xs tracking-[0.3em] transition-all ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
          }`}
        >
          {loading ? "Vérification..." : "Confirmer et Payer"}
        </button>
      </div>
    </div>
  );
}
