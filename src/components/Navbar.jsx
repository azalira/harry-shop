import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // État pour les notifications
  const navigate = useNavigate();
  
  const { cart } = useCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    // 1. Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchRole(session.user.id);
        fetchUnreadCount(session.user.id);
      }
    });

    // 2. Écouter les changements d'état (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchRole(session.user.id);
        fetchUnreadCount(session.user.id);
      } else {
        setRole(null);
        setUnreadCount(0);
      }
    });

    // 3. Écouter les nouvelles notifications en TEMPS RÉEL
    let channel;
    if (session) {
      channel = supabase
        .channel('realtime_notifications')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` }, 
          () => fetchUnreadCount(session.user.id)
        )
        .subscribe();
    }

    return () => {
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  async function fetchRole(userId) {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setRole(data.role);
  }

  async function fetchUnreadCount(userId) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive 
      ? "text-orange-500 font-bold border-b-2 border-orange-500 pb-1" 
      : "text-gray-500 hover:text-black transition-all pb-1";

  return (
    <div className="flex justify-center mt-10 px-4">
      <nav className="w-full max-w-[1100px] bg-white shadow-sm rounded-sm px-8 py-6 flex items-center justify-between border border-gray-50 relative">
        
        <NavLink to="/" className="font-black text-2xl tracking-tighter text-black hover:opacity-80">
          HARRY.SHOP
        </NavLink>

        <ul className="flex gap-6 text-[11px] font-black tracking-widest items-center uppercase">
          <li><NavLink to="/" className={linkClass}>HOME</NavLink></li>
          <li><NavLink to="/shop" className={linkClass}>SHOP</NavLink></li>
          
          {!session ? (
            <>
              <li><NavLink to="/login" className={linkClass}>CONNEXION</NavLink></li>
              <li><NavLink to="/register" className={linkClass}>S'INSCRIRE</NavLink></li>
            </>
          ) : (
            <>
              {role === 'admin' && (
                <li>
                  <NavLink to="/admin" className="text-red-600 font-black border-b-2 border-red-600 pb-1">
                    ADMIN PANEL
                  </NavLink>
                </li>
              )}

              {role === 'vendeur' && (
                <>
                  <li><NavLink to="/dashboard" className={linkClass}>DASHBOARD</NavLink></li>
                  <li><NavLink to="/seller-orders" className={linkClass}>MES VENTES</NavLink></li>
                </>
              )}

              {role === 'client' && (
                <li><NavLink to="/my-orders" className={linkClass}>MES ACHATS</NavLink></li>
              )}

              {/* ICÔNE NOTIFICATIONS */}
              <li>
                <NavLink to="/notifications" className="relative group">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 group-hover:border-black transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>

              {/* BADGE RÔLE */}
              <li className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                <span className={`w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-red-500' : role === 'vendeur' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                <span className="text-[9px] text-gray-500 font-black">{role || "Membre"}</span>
              </li>
              
              <li>
                <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-widest">
                  DÉCO.
                </button>
              </li>
            </>
          )}

          {/* PANIER */}
          <li>
            <NavLink to="/cart" className="relative">
              <div className="ml-2 w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-400 cursor-pointer hover:bg-orange-400 hover:text-white transition-all border border-orange-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalItems}
                </span>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}