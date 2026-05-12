import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import StorageImage from "../components/StorageImage";
import { toast } from "sonner";
import { useState } from "react";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, totalPrice } = useCart();
  const [clearing, setClearing] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/payment", { state: { cartItems: cart, totalPrice } });
  };

  const handleClear = () => {
    setClearing(true);
    clearCart();
    toast.success("Panier vidé");
    setClearing(false);
  };

  const handleRemove = (id, name) => {
    removeFromCart(id);
    toast.info(`${name} retiré du panier`);
  };

  const deliveryFee = totalPrice >= 50 ? 0 : 4.99;
  const grandTotal = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Panier</h1>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {cart.length} article{cart.length > 1 ? "s" : ""}
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="border-4 border-dashed border-gray-200 py-32 text-center rounded-xl">
            <p className="text-gray-300 font-black uppercase text-lg tracking-widest mb-6">
              Votre panier est vide
            </p>
            <Link
              to="/shop"
              className="inline-block bg-black text-white px-10 py-4 font-black text-[11px] tracking-[0.3em] uppercase hover:bg-orange-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]"
            >
              Continuer vos achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-5 p-5 bg-white border border-gray-200 hover:shadow-md transition-all rounded-xl"
                >
                  <div className="w-24 h-24 bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                    <StorageImage
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      fallback="https://via.placeholder.com/100"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black uppercase text-sm tracking-tight truncate">{item.name}</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                      Prix unitaire
                    </p>
                    <p className="font-black text-lg">{Number(item.price).toFixed(2)}€</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qté</p>
                    <p className="font-black text-lg">{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                    <p className="font-black text-xl text-orange-600">
                      {(Number(item.price) * item.quantity).toFixed(2)}€
                    </p>
                    <button
                      onClick={() => handleRemove(item.id, item.name)}
                      className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-colors mt-1 tracking-widest"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 p-6 h-fit sticky top-6 rounded-xl">
              <h3 className="font-black uppercase text-sm tracking-tight mb-6 border-b pb-4">Résumé</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-bold">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Livraison</span>
                  <span className="font-bold">{deliveryFee === 0 ? "GRATUITE" : `${deliveryFee.toFixed(2)}€`}</span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">
                    + {Math.ceil(50 - totalPrice)}€ pour la livraison gratuite
                  </p>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-black uppercase">Total</span>
                    <span className="font-black text-orange-600">{grandTotal.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 font-black text-[11px] tracking-[0.3em] uppercase hover:bg-orange-500 transition-all"
                >
                  Procéder au paiement
                </button>
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="w-full bg-gray-100 text-gray-500 py-3 font-black text-[10px] tracking-widest uppercase hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Vider le panier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}