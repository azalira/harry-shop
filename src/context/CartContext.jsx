import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error("Erreur lecture localStorage cart:", e);
      localStorage.removeItem("cart");
    }
    return [];
  });

  const [userId, setUserId] = useState(null);

  // Surveiller la session Supabase pour savoir qui est connecté
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sauvegarder dans le localStorage quand le panier change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // AJOUTER : On injecte le userId dans l'objet produit (optionnel pour le moment)
  const addToCart = (product, quantity) => {
    // Temporairement désactivé pour tester
    // if (!userId) {
    //   alert("Connecte-toi pour ajouter des articles au panier !");
    //   return;
    // }

    setCart((prevCart) => {
      // On cherche si le produit existe DEJA pour CET utilisateur
      const existingItem = prevCart.find(
        (item) => item.id === product.id && (!userId || item.userId === userId)
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && (!userId || item.userId === userId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // On enregistre le produit avec la clé userId (si disponible)
      return [...prevCart, { ...product, quantity, userId }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id && (!userId || item.userId === userId)));
  };

  const clearCart = () => {
    // On ne vide que les articles de l'utilisateur actuel (ou tous si pas connecté)
    if (userId) {
      setCart(cart.filter((item) => item.userId !== userId));
    } else {
      setCart([]);
    }
  };

  // FILTRE : Seuls les articles de l'utilisateur actuel sont comptés (ou tous si pas connecté)
  const userCart = userId ? cart.filter((item) => item.userId === userId) : cart;

  const totalPrice = userCart.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  return (
    <CartContext.Provider 
      value={{ 
        cart: userCart, // On n'expose que le panier filtré au reste de l'app
        addToCart, 
        removeFromCart, 
        clearCart, 
        totalPrice 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);