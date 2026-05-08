import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group flex flex-col w-full cursor-pointer"
    >
      {/* SECTION IMAGE */}
      <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-3 border border-gray-50">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      {/* SECTION INFOS */}
      <div className="px-1 space-y-1">
        <h3 className="text-[11px] font-black uppercase tracking-tighter text-gray-900 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <p className="text-[12px] font-black italic">{product.price}€</p>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
            {product.profiles?.username || "Shop"}
          </span>
        </div>
      </div>
    </Link>
  );
}