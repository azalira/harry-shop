// src/services/api.js
import { supabase } from './supabaseClient'

// ============================================================
// 1. GESTION DES PRODUITS (Multi-Vendeur)
// ============================================================

/**
 * Récupère tous les produits avec jointure corrigée
 */
export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        stock,
        image_url,
        description,
        created_at,
        profiles (
          id,
          username
        )
      `) // Retrait de avatar_url ici
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;

  } catch (error) {
    console.error("Erreur api getProducts:", error.message);
    return []; 
  }
}

/**
 * Récupère un seul produit par son ID
 */
export async function getProductById(productId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles (
          id,
          username
        )
      `) // Retrait de avatar_url ici
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error("Erreur api getProductById:", error.message);
    return null;
  }
}

// ============================================================
// 2. AUTHENTIFICATION & UTILISATEURS
// ============================================================

export const signUpUser = async (email, password, role, username) => {
  if (role === 'admin') {
    throw new Error("La création d'un compte administrateur n'est pas autorisée.");
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id, 
            role: role, 
            username: username 
          }
        ]);
      
      if (profileError) throw profileError;
    }

    return data;

  } catch (error) {
    console.error("Erreur api signUpUser:", error.message);
    throw error;
  }
};

// ============================================================
// 3. ANNULATION DE COMMANDE (partagé MyOrders + SellerOrders)
// ============================================================

export async function cancelOrder(orderId, productId, quantity) {
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
}