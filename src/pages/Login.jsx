import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Connexion réussie !");
      navigate('/'); // Redirige vers l'accueil
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 border border-gray-200 shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-black mb-6 text-center tracking-tighter">CONNEXION</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-3 border rounded-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Mot de passe</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white p-4 font-bold tracking-widest hover:bg-gray-800 transition-colors"
          >
            {loading ? 'CHARGEMENT...' : 'SE CONNECTER'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-black font-bold underline hover:text-orange-600">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}