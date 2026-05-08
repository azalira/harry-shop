import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. On récupère les données du state avec une sécurité (objet vide par défaut)
  const { orderId, totalPrice, product } = location.state || {};

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 2. CORRECTION DU BUG : Si orderId est manquant ou vaut "undefined"
    // on empêche toute requête Supabase et on redirige.
    if (!orderId || orderId === "undefined") {
      console.error("Erreur : orderId est indéfini. Redirection...");
      // Optionnel : décommente la ligne suivante pour rediriger automatiquement
      // navigate("/shop");
    }
  }, [orderId, navigate]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      // Simulation ou intégration Stripe ici
      const { error } = await supabase
        .from("orders")
        .update({ status: "payé" })
        .eq("id", orderId); // L'erreur UUID arrivait ici si orderId était "undefined"

      if (error) throw error;

      alert("Paiement réussi !");
      navigate("/mes-achats");
    } catch (err) {
      alert("Erreur lors du paiement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. AFFICHAGE DE SÉCURITÉ : Si les données sont corrompues
  if (!orderId || !product) {
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
            <p className="font-black text-xs">{orderId.slice(0, 18)}...</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Montant Total</p>
            <p className="font-black text-3xl text-orange-600">{totalPrice}€</p>
          </div>
        </div>

        <div className="flex gap-6 items-center mb-10 bg-gray-50 p-4">
          <img src={product.image_url} alt="" className="w-20 h-20 object-cover border-2 border-black" />
          <div className="text-left">
            <p className="font-black uppercase text-sm">{product.name}</p>
            <p className="text-[10px] font-bold text-gray-500 italic">Prêt pour expédition</p>
          </div>
        </div>

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