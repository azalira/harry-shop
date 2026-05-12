import { useState, useEffect, useRef } from "react";
import { supabase, STORAGE_BUCKET } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    image_url: ""
  });
  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Fonction pour uploader l'image vers Supabase Storage
  const uploadImage = async (file) => {
    if (!file) return null;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file);

    if (error) {
      console.error(`Erreur upload bucket=${STORAGE_BUCKET}:`, error);
      toast.error(`Erreur upload : ${error.message || JSON.stringify(error)}`);
      setUploading(false);
      return null;
    }

    setUploading(false);
    return filePath;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide');
        return;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = URL.createObjectURL(file);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNaN(parseFloat(form.price)) || isNaN(parseInt(form.stock))) {
      toast.error("Le prix et le stock doivent être des nombres valides.");
      return;
    }
    if (parseFloat(form.price) < 0 || parseInt(form.stock) < 0) {
      toast.error("Le prix et le stock doivent être positifs.");
      return;
    }

    let imageUrl = form.image_url;

    // Si un fichier est sélectionné, l'uploader
    if (selectedFile) {
      imageUrl = await uploadImage(selectedFile);
      if (!imageUrl) return; // Erreur d'upload
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("products")
      .insert([
        {
          ...form,
          image_url: imageUrl,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          seller_id: user.id
        }
      ]);

    if (!error) {
      toast.success("Produit ajouté avec succès !");
      navigate("/dashboard");
    } else {
      toast.error("Erreur : " + error.message);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto mt-20 p-10 bg-white border border-gray-100 shadow-sm rounded-xl">
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

        {/* UPLOAD D'IMAGE */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image du produit</label>
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border-b border-gray-200 p-3 outline-none focus:border-black text-xs font-bold file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {selectedFile && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Aperçu :</p>
                <img
                  src={previewUrlRef.current}
                  alt="Aperçu"
                  className="w-32 h-32 object-cover border border-gray-200 rounded-lg"
                />
              </div>
            )}
            {uploading && (
              <p className="text-xs text-orange-600 mt-2">Upload en cours...</p>
            )}
          </div>
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
            <option value="electronic">Électronique</option>
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