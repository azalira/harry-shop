import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [form, setForm] = useState({ 
    name: "", 
    price: "", 
    stock: "", 
    description: "", 
    category: "",
    image_url: "" // Ajout de l'état pour l'image
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(form.price) < 0 || parseInt(form.stock) < 0) {
      alert("Erreur : Le prix et le stock doivent être positifs.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("products")
      .insert([
        { 
          ...form, 
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          seller_id: user.id 
        }
      ]);

    if (!error) {
      alert("Produit ajouté avec succès !");
      navigate("/dashboard");
    } else {
      alert("Erreur : " + error.message);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto mt-20 p-10 bg-white border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b pb-4">Ajouter un produit</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NOM */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nom de l'article</label>
          <input 
            type="text"
            className="w-full border-b border-gray-200 p-3 outline-none focus:border-black uppercase text-xs font-bold"
            onChange={(e) => setForm({...form, name: e.target.value})}
            required
          />
        </div>

        {/* LIEN DE L'IMAGE (NOUVEAU) */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL de l'image (Lien direct)</label>
          <input 
            type="url"
            placeholder="https://exemple.com/image.jpg"
            className="w-full border-b border-gray-200 p-3 outline-none focus:border-black text-xs font-bold"
            onChange={(e) => setForm({...form, image_url: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix (€)</label>
            <input 
              type="number" 
              min="0"
              step="0.01"
              className="w-full border-b border-gray-200 p-3 outline-none focus:border-black font-black text-lg"
              onChange={(e) => setForm({...form, price: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock</label>
            <input 
              type="number" 
              min="0"
              className="w-full border-b border-gray-200 p-3 outline-none focus:border-black font-black text-lg"
              onChange={(e) => setForm({...form, stock: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Catégorie</label>
          <select 
            className="w-full border-b border-gray-200 p-3 outline-none focus:border-black text-xs font-bold uppercase"
            onChange={(e) => setForm({...form, category: e.target.value})}
            required
          >
            <option value="">Sélectionner</option>
            <option value="T-shirts">T-shirts</option>
            <option value="Pantalons">Pantalons</option>
            <option value="Chaussures">Chaussures</option>
            <option value="Vestes">Vestes</option>
            <option value="Accessoires">Accessoires</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
          <textarea 
            className="w-full border border-gray-100 p-4 outline-none focus:border-black h-32 text-xs font-bold leading-relaxed"
            onChange={(e) => setForm({...form, description: e.target.value})}
            required
          />
        </div>

        <button type="submit" className="w-full bg-black text-white py-5 font-black text-[11px] tracking-[0.3em] uppercase hover:bg-orange-500 transition-all shadow-lg">
          Publier le produit
        </button>
      </form>
    </div>
  );
}