import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import StorageImage from "../components/StorageImage";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, totalPrice } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/payment", { state: { cartItems: cart, totalPrice } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Votre Panier</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Votre panier est vide</p>
            <a
              href="/shop"
              className="inline-block mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Continuer vos achats
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Liste des articles */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                  <StorageImage
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    fallback="https://via.placeholder.com/100x100?text=No+Image"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">{item.price}€</p>
                    <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {(item.price * item.quantity).toFixed(2)}€
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total et actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-orange-600">{totalPrice.toFixed(2)}€</span>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={clearCart}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Vider le panier
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Procéder au paiement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}