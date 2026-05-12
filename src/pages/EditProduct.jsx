import { useEffect, useState } from "react";
import { supabase, STORAGE_BUCKET } from "../services/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import useStorageImageUrl from "../hooks/useStorageImageUrl";
import { toast } from "sonner";
import { TextSkeleton } from "../components/Skeletons";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: "",
  });

  const [currentImageValue, setCurrentImageValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const currentImageUrl = useStorageImageUrl(currentImageValue);

  useEffect(() => {
    fetchProduct();
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [id]);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erreur fetch:", error);
      navigate("/dashboard");
      return;
    }

    setForm({
      name: data.name || "",
      price: data.price || "",
      stock: data.stock || "",
      description: data.description || "",
      category: data.category || "",
    });
    setCurrentImageValue(data.image_url || "");
    setLoading(false);
  }

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // 1. Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      return filePath;

    } catch (error) {
      toast.error("Erreur upload: " + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image trop lourde (max 5Mo)");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (isNaN(parseFloat(form.price)) || isNaN(parseInt(form.stock))) {
      toast.error("Le prix et le stock doivent être des nombres valides.");
      setSaving(false);
      return;
    }
    if (parseFloat(form.price) < 0 || parseInt(form.stock) < 0) {
      toast.error("Le prix et le stock doivent être positifs.");
      setSaving(false);
      return;
    }

    let finalImageUrl = currentImageValue;

    if (selectedFile) {
      const uploadedUrl = await uploadImage(selectedFile);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Veuillez vous reconnecter.");
      setSaving(false);
      return;
    }

    console.log("Updating product:", { id, form, finalImageUrl });

    const { data, error } = await supabase
      .from("products")
      .update({
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        description: form.description,
        category: form.category,
        image_url: finalImageUrl,
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Erreur update:", error);
      toast.error("Erreur update: " + error.message);
      setSaving(false);
    } else if (!data || data.length === 0) {
      console.error("Aucune ligne mise à jour - id invalide ?", { id });
      toast.error("Produit introuvable (id invalide).");
      setSaving(false);
    } else {
      console.log("Update success:", data);
      toast.success("Produit mis à jour avec succès !");
      navigate("/dashboard");
    }
  };

  if (loading) return (
    <div className="max-w-[600px] mx-auto mt-20 p-10">
      <div className="h-8 w-64 bg-gray-100 mb-8" />
      <div className="space-y-6">
        <TextSkeleton lines={1} />
        <div className="flex gap-6 items-center p-4 bg-gray-50">
          <div className="w-24 h-24 bg-gray-200 flex-shrink-0" />
          <div className="flex-1"><TextSkeleton lines={1} /></div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <TextSkeleton lines={1} />
          <TextSkeleton lines={1} />
        </div>
        <TextSkeleton lines={1} />
        <TextSkeleton lines={3} />
      </div>
    </div>
  );

  return (
    <div className="max-w-[600px] mx-auto mt-20 p-10 bg-white border border-gray-100 shadow-sm rounded-xl">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b pb-4">Modifier le produit</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NOM */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nom de l'article</label>
          <input
            type="text"
            value={form.name}
            className="w-full border-b border-gray-200 p-3 outline-none focus:border-black uppercase text-xs font-bold"
            onChange={(e) => setForm({...form, name: e.target.value})}
            required
          />
        </div>

        {/* SECTION IMAGE */}
        <div className="flex gap-6 items-center p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
          <div className="w-24 h-24 bg-white border border-gray-100 flex-shrink-0">
            <img 
              src={previewUrl || currentImageUrl || 'https://via.placeholder.com/150'} 
              alt="Aperçu" 
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Changer l'image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="text-[10px] w-full"
            />
            {uploading && <p className="text-orange-500 text-[9px] font-bold mt-2 uppercase">Upload en cours...</p>}
          </div>
        </div>

        {/* PRIX & STOCK */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix (€)</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              className="w-full border-b border-gray-200 p-3 outline-none focus:border-black font-black text-lg"
              onChange={(e) => setForm({...form, price: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock</label>
            <input
              type="number"
              value={form.stock}
              className="w-full border-b border-gray-200 p-3 outline-none focus:border-black font-black text-lg"
              onChange={(e) => setForm({...form, stock: e.target.value})}
              required
            />
          </div>
        </div>

        {/* CATEGORIE */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Catégorie</label>
          <select
            value={form.category}
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

        {/* DESCRIPTION */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
          <textarea
            value={form.description}
            className="w-full border border-gray-100 p-4 outline-none focus:border-black h-32 text-xs font-bold"
            onChange={(e) => setForm({...form, description: e.target.value})}
            required
          />
        </div>

        {/* BOUTONS */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 bg-black text-white py-5 font-black text-[11px] tracking-[0.3em] uppercase hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-gray-100 text-gray-500 py-5 font-black text-[11px] tracking-[0.3em] uppercase hover:bg-gray-200 transition-all"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}