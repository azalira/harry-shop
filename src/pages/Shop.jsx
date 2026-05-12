import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`*, profiles (username)`);
        if (error) throw error;
        setProducts(data);
      } catch (error) {
        console.error("Erreur:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() =>
    products.filter((product) => {
      const normalized = `${product.name || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
      return normalized.includes(searchQuery);
    }),
    [products, searchQuery]
  );

  // Ce composant interne gère l'affichage pendant le chargement
  const ShopSkeleton = () => (
    <div className="flex flex-col w-full">
      {/* Fond plus foncé (gray-200) pour ressortir sur le blanc */}
      <div className="relative overflow-hidden bg-gray-200 aspect-[3/4] mb-3 rounded-sm">
        {/* Lueur blanche plus prononcée pour le contraste */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer -translate-x-full"></div>
      </div>
      <div className="space-y-2 px-1">
        {/* Titre factice (gray-200) */}
        <div className="h-3 w-5/6 bg-gray-200 relative overflow-hidden rounded-sm">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer -translate-x-full"></div>
        </div>
        {/* Prix factice (gray-300 pour varier les tons) */}
        <div className="h-3 w-1/4 bg-gray-300 relative overflow-hidden rounded-sm">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer -translate-x-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-6 mb-10">
      
      {/* HEADER SECTION - COMPACTE */}
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-orange-500 mb-1">
          Explorer
        </span>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic text-black">
          Le Shop<span className="text-orange-500">.</span>
        </h1>
        <div className="w-8 h-[2px] bg-black mt-3"></div>
      </div>

      {/* GRILLE DE PRODUITS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10"> 
        {loading ? (
          <>
            <ShopSkeleton /> <ShopSkeleton /> <ShopSkeleton />
            <ShopSkeleton /> <ShopSkeleton /> <ShopSkeleton />
          </>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-500 font-black uppercase text-[11px] tracking-widest mb-3">Aucun produit trouvé.</p>
            {searchQuery && (
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.35em]">Essayez une autre recherche.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}