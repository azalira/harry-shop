import { Link } from "react-router-dom";
import StorageImage from "./StorageImage";

export default function ProductCard({ product }) {
  // On récupère le vendeur. S'il n'existe pas, on met des valeurs par défaut.
  const seller = product.profiles || { username: "Boutique", avatar_url: null };
  const stockCount = Number(product.stock) || 0;
  const isInStock = stockCount > 0;

  return (
    <div className="relative flex flex-col bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-all duration-300 group font-smoothing-antialiased">
      {!isInStock && (
        <span className="absolute top-4 right-4 px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded">
          Rupture de stock
        </span>
      )}
      
      {/* SECTION VENDEUR - NOUVEAU */}
      <div className="flex items-center gap-3 mb-4 pb-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-200">
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
          <p className="text-[9px] font-black uppercase tracking-widest text-orange-500">Vendeur</p>
          <p className="text-xs font-bold text-black">{seller.username}</p>
        </div>
      </div>

      {/* SECTION PRODUIT */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square mb-4 rounded-md">
        <StorageImage
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      
      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase text-black tracking-tight text-balance">{product.name}</h3>
        <p className="text-xl font-black text-black tabular-nums">{product.price}€</p>
        <p className={`text-[11px] font-black uppercase tracking-widest ${isInStock ? 'text-emerald-600' : 'text-red-600'}`}>
          {isInStock ? `En stock : ${stockCount}` : 'Rupture de stock'}
        </p>
      </div>
    </div>
  );
}