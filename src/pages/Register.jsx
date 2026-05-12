import { useState } from 'react';
import { signUpUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpUser(email, password, role, username);
      toast.success("Inscription réussie ! Vérifiez vos emails.");
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 border border-gray-200 shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-black mb-6 text-center tracking-tighter">CRÉER UN COMPTE</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Nom d'utilisateur</label>
            <input 
              type="text"
              className="w-full p-3 border rounded-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="votre pseudo"
              onChange={(e) => setUsername(e.target.value)} required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input 
              type="email"
              className="w-full p-3 border rounded-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="votre@email.com"
              onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Mot de passe</label>
            <input 
              type="password"
              className="w-full p-3 border rounded-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Je souhaite être</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border rounded-sm focus:ring-2 focus:ring-black outline-none bg-white"
            >
              <option value="client">Acheteur (Client)</option>
              <option value="vendeur">Vendeur (Pro)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white p-4 font-bold tracking-widest hover:bg-gray-800 transition-colors"
          >
            {loading ? 'CHARGEMENT...' : "S'INSCRIRE"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-black font-bold underline hover:text-orange-600">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}