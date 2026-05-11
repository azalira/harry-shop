import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import StorageImage from "../components/StorageImage";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function cancelOrder(orderId, productId, quantity) {
    if (!confirm("Voulez-vous vraiment annuler cette commande ?")) return;

    try {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "annulé" })
        .eq("id", orderId);

      if (updateError) throw updateError;

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: product.stock + quantity })
        .eq("id", productId);

      if (stockError) throw stockError;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "annulé" } : o
        )
      );
    } catch (err) {
      alert("Erreur lors de l'annulation : " + err.message);
    }
  }

  async function fetchOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          products ( name, image_url, price )
        `)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur de récupération:", error.message);
      } else {
        setOrders(data);
      }
    } catch (err) {
      console.error("Erreur système:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalDepense = orders.reduce((acc, order) => acc + (order.total_price || 0), 0);

  if (loading) return (
    <div className="flex justify-center items-center h-screen font-black uppercase tracking-[0.2em]">
      Chargement de votre historique...
    </div>
  );

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-16">
      <div className="mb-12 border-b pb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Mes Achats</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">
            {orders.length} commande{orders.length > 1 ? "s" : ""} trouvée{orders.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total dépensé</p>
          <p className="text-2xl font-black text-orange-600">{totalDepense.toFixed(2)}€</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Article</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 overflow-hidden">
                        <StorageImage
                          src={order.products?.image_url}
                          alt={order.products?.name || "Produit"}
                          className="w-full h-full object-cover"
                          fallback="https://via.placeholder.com/100"
                        />
                      </div>
                      <span className="font-black uppercase text-xs tracking-tight">
                        {order.products?.name || "Produit supprimé"}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-6 font-black text-sm text-orange-600">
                    {order.total_price}€
                  </td>
                  <td className="py-6 text-right">
                    <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest">
                      {order.status}
                    </span>
                    {(order.status === "en attente" || order.status === "payé") && (
                      <button
                        onClick={() => cancelOrder(order.id, order.product_id, order.quantity)}
                        className="ml-2 px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-24 text-center">
                  <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.3em]">
                    Aucun achat effectué pour le moment
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
