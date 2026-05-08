import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerData();
  }, []);

  async function fetchSellerData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
      setProducts(data || []);
    }
    setTimeout(() => setLoading(false), 800);
  }

  const SkeletonCard = () => (
    <div className="relative overflow-hidden flex items-center justify-between p-6 border border-gray-100 bg-white">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer -translate-x-full"></div>
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-gray-100"></div>
        <div className="flex flex-col gap-2">
          <div className="h-5 w-48 bg-gray-100"></div>
          <div className="h-7 w-20 bg-gray-50"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto mt-10 px-6">
      <div className="flex justify-between items-end border-b pb-8 border-gray-100">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Dashboard</h1>
        <Link to="/add-product" className="bg-black text-white px-8 py-4 font-bold text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-all">
          + Ajouter
        </Link>
      </div>

      <div className="mt-12 space-y-4">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-6 border border-gray-100 bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-6">
              <img src={product.image_url} alt="" className="w-20 h-20 object-cover bg-gray-50" />
              <div>
                <h4 className="font-bold text-lg uppercase">{product.name}</h4>
                <p className="text-orange-500 font-black text-xl">{product.price}€</p>
              </div>
            </div>
            <div className="flex gap-6">
              <Link to={`/edit-product/${product.id}`} className="text-[11px] font-bold uppercase text-gray-400 hover:text-black transition">Modifier</Link>
              <button className="text-[11px] font-bold uppercase text-red-300 hover:text-red-600 transition">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}