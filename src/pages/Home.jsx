import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";

// 1. Importation de l'image d'arrière-plan
import heroBgImage from "../asset/hero-bg.png"; // Remplacez par le nom de votre fichier

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        const data = await getProducts(); // Récupère tes vrais produits
        setProducts(data || []);
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    }
    loadHomeProducts();
  }, []);

  // --- COMPOSANT SQUELETTE POUR LA GRILLE ---
  const HomeProductSkeleton = () => (
    <div         className="flex flex-col w-full bg-white border border-gray-100 rounded-xl p-4 relative overflow-hidden">
      {/* Effet Shimmer (Balayage) */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer -translate-x-full"></div>
      
      {/* Squelette Vendeur (Optionnel) */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-50">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        <div className="space-y-1.5 flex-1">
          <div className="h-2 w-16 bg-gray-200 rounded-sm"></div>
          <div className="h-3 w-24 bg-gray-200 rounded-sm"></div>
        </div>
      </div>

      {/* Squelette Image Produit */}
      <div className="aspect-square bg-gray-200 mb-4 rounded-sm"></div>
      
      {/* Squelette Titre & Prix */}
      <div className="space-y-2 px-1">
        <div className="h-4 w-3/4 bg-gray-200 rounded-sm relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer -translate-x-full"></div>
        </div>
        <div className="h-4 w-1/4 bg-gray-100 rounded-sm relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer -translate-x-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 bg-white font-smoothing-antialiased">
      {/* SECTION HERO AVEC IMAGE DE FOND - NOUVEAU DESIGN */}
      <section 
        className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBgImage})` }} // Application de l'image
      >
        {/* 2. Overlay sombre pour garantir la lisibilité du texte */}
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

        {/* 3. Le Contenu Hero central */}
        <div className="flex flex-col items-center justify-center text-center px-6 py-20 z-10">
          <span className="text-orange-500 font-black tracking-[0.4em] text-[11px] uppercase mb-6 animate-fade-in-up">
            HARRY.SHOP : LE COLLECTIF DE STYLE.
          </span>
          <h2 className="text-5xl md:text-6xl font-black uppercase italic text-white leading-[1.1] mb-10 max-w-4xl animate-fade-in-up delay-100 text-balance">
            Élevez Votre <br className="hidden md:block"/> Style Quotidien
          </h2>
          <p className="text-sm text-gray-200 mb-14 max-w-xl animate-fade-in-up delay-200">
            Découvrez une sélection exclusive de streetwear conçu pour marquer les esprits.
          </p>
          <Link to="/shop" className="bg-white text-black px-12 py-5 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-2xl rounded-lg animate-fade-in-up delay-300">
            Découvrir le shop
          </Link>
        </div>
      </section>

      {/* PRODUCTS GRID SECTION (Sélection) */}
      <section className="max-w-[1300px] mx-auto px-6 py-20 mb-16">
        {/* En-tête de section */}
        <div className="flex justify-between items-end mb-16 border-b pb-8 border-gray-100">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Notre sélection</p>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter text-black text-balance">Nos Produits Phares</h2>
          </div>
          <Link to="/shop" className="text-[11px] font-black border-b-2 border-black pb-1 uppercase tracking-widest text-black hover:text-orange-500 hover:border-orange-500 transition-colors">
            Tout voir
          </Link>
        </div>

        {/* Grille de produits ou Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            // Affiche 6 squelettes pendant le chargement
            <>
              <HomeProductSkeleton /> <HomeProductSkeleton /> <HomeProductSkeleton />
              <HomeProductSkeleton /> <HomeProductSkeleton /> <HomeProductSkeleton />
            </>
          ) : products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            // Message si aucun produit n'est trouvé
            <div className="col-span-full text-center py-32 border border-dashed border-gray-100 rounded-lg bg-gray-50 shadow-sm">
              <p className="text-gray-300 font-black uppercase text-xs tracking-widest">
                Aucun produit phare disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}