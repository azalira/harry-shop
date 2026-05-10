// Script à exécuter dans la console du navigateur (sur la page Shop ou Dashboard)

// Fonction pour mettre à jour le stock des produits existants
async function updateExistingProductsStock() {
  try {
    // Récupérer tous les produits
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, stock, name');

    if (fetchError) {
      console.error('Erreur lors de la récupération des produits:', fetchError);
      return;
    }

    console.log(`Trouvé ${products.length} produits`);

    // Afficher les produits et leur stock actuel
    products.forEach(p => {
      console.log(`Produit "${p.name}": stock = ${p.stock}`);
    });

    // Identifier les produits sans stock défini
    const productsWithoutStock = products.filter(p => p.stock === null || p.stock === undefined || p.stock === '');

    console.log(`${productsWithoutStock.length} produits sans stock défini`);

    if (productsWithoutStock.length > 0) {
      // Mettre à jour chaque produit avec un stock par défaut de 10
      for (const product of productsWithoutStock) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: 10 })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Erreur mise à jour produit ${product.id}:`, updateError);
        } else {
          console.log(`✅ Produit "${product.name}" mis à jour avec stock = 10`);
        }
      }
    }

    console.log('Mise à jour terminée - Rafraîchissez la page pour voir les changements');

  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

// Exécuter la fonction
updateExistingProductsStock();