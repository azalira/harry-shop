import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  // On récupère le vendeur. S'il n'existe pas, on met des valeurs par défaut.
  const seller = product.profiles || { username: "Boutique", avatar_url: null };

  return (
    <div className="flex flex-col bg-white border border-gray-100 rounded-sm p-4 hover:shadow-lg transition-shadow duration-300 group">
      
      {/* SECTION VENDEUR - NOUVEAU */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-50">
        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
          {seller.avatar_url ? (
            <img src={seller.avatar_url} alt={seller.username} className="w-full h-full object-cover" />
          ) : (
            // Placeholder d'avatar avec initiale
            <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-bold text-sm uppercase">
              {seller.username.substring(0, 1)}
            </div>
          )}
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-orange-500">Créateur</p>
          <p className="text-xs font-bold text-black">{seller.username}</p>
        </div>
      </div>

      {/* SECTION PRODUIT */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square mb-4">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      
      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase text-black tracking-tight">{product.name}</h3>
        <p className="text-xl font-black text-black">{product.price}€</p>
      </div>
    </div>
  );
}