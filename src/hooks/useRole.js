import { useAuth } from '../context/AuthContext';

export const useRole = () => {
  const { role } = useAuth();
  
  return {
    isVendeur: role === 'vendeur',
    isClient: role === 'client',
    isAdmin: role === 'admin',
    role
  };
};