import { useState } from 'react';
import { signUpUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('client'); // Par défaut client
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpUser(email, password, role, username);
      alert("Inscription réussie ! Vérifiez vos emails.");
      navigate('/'); // Redirection vers l'accueil
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Créer un compte</h2>
        
        <input 
          type="text" placeholder="Nom d'utilisateur" 
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setUsername(e.target.value)} required
        />
        
        <input 
          type="email" placeholder="Email" 
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)} required
        />
        
        <input 
          type="password" placeholder="Mot de passe" 
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setPassword(e.target.value)} required
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Je souhaite être :</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border rounded bg-gray-50"
          >
            <option value="client">Acheteur (Client)</option>
            <option value="vendeur">Vendeur (Pro)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded font-bold hover:bg-gray-800 transition"
        >
          {loading ? 'Chargement...' : "S'INSCRIRE"}
        </button>
      </form>
    </div>
  );
}