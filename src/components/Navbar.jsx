import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchCandidates, setSearchCandidates] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { cart } = useCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
        fetchUnreadCount(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
        fetchUnreadCount(session.user.id);
      } else {
        setRole(null);
        setUsername(null);
        setUnreadCount(0);
      }
    });

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentSearch = params.get("search") || "";
    setSearchText(currentSearch);
  }, [location.search]);

  useEffect(() => {
    async function fetchSearchCandidates() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('name, category')
          .order('name', { ascending: true })
          .limit(100);

        if (error) throw error;
        setSearchCandidates(data || []);
      } catch (error) {
        console.error('Erreur suggestions:', error.message);
      }
    }

    fetchSearchCandidates();
  }, []);

  useEffect(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = searchCandidates
      .filter((product) => {
        const normalized = `${product.name || ""} ${product.category || ""}`.toLowerCase();
        return normalized.includes(query);
      })
      .slice(0, 6);

    setFilteredSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [searchText, searchCandidates]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchText.trim();
    setShowSuggestions(false);
    navigate(`/shop${query ? `?search=${encodeURIComponent(query)}` : ""}`);
  };

  const handleSuggestionClick = (value) => {
    setSearchText(value);
    setShowSuggestions(false);
    navigate(`/shop?search=${encodeURIComponent(value)}`);
  };

  async function fetchUserData(userId) {
    const { data } = await supabase.from('profiles').select('role, username').eq('id', userId).single();
    if (data) {
      setRole(data.role);
      setUsername(data.username);
    }
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
      <nav className="w-full max-w-[1100px] bg-white shadow-md rounded-lg px-8 py-6 flex items-center justify-between relative font-smoothing-antialiased">
        
        <NavLink to="/" className="font-black text-2xl tracking-tighter text-black hover:opacity-80">
          HARRY.SHOP
        </NavLink>

        <div className="hidden lg:flex flex-1 mx-8 items-center justify-center">
          <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
            <label htmlFor="nav-search" className="sr-only">Recherche produits</label>
            <div className="relative">
              <input
                id="nav-search"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Rechercher un produit..."
                className="w-full border border-gray-200 rounded-full py-2 pl-4 pr-24 text-[10px] uppercase tracking-[0.25em] text-gray-600 focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black text-white p-2 flex items-center justify-center hover:bg-orange-500 transition-all"
                aria-label="Rechercher"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
                </svg>
              </button>

              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                  {filteredSuggestions.map((product, index) => (
                    <button
                      key={`${product.name}-${index}`}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(product.name)}
                      className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-gray-700 hover:bg-gray-100"
                    >
                      {product.name}
                      {product.category && (
                        <span className="block text-[8px] uppercase tracking-[0.35em] text-gray-400 mt-1">{product.category}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="lg:hidden flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center border border-gray-200 shadow-sm"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        <ul className="hidden lg:flex gap-6 text-[11px] font-black tracking-widest items-center uppercase">
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
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 group-hover:border-black transition-all ring-1 ring-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>

              {/* BADGE RÔLE */}
              <li className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full shadow-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-red-500' : role === 'vendeur' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                <span className="text-[9px] text-gray-500 font-black">{role || "Membre"}</span>
              </li>

              {/* NOM UTILISATEUR */}
              {username && (
                <li className="flex items-center px-3 py-1 bg-black text-white rounded-full shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest">{username}</span>
                </li>
              )}
              
              <li>
                <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-widest">
                  DÉCO.
                </button>
              </li>

              {/* PANIER (AFFICHÉ UNIQUEMENT SI CONNECTÉ) */}
              <li>
                <NavLink to="/cart" className="relative">
                  <div className="ml-2 w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-400 cursor-pointer hover:bg-orange-400 hover:text-white transition-all border border-orange-100 ring-1 ring-orange-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white tabular-nums">
                      {totalItems}
                    </span>
                  )}
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-x-4 top-full mt-3 rounded-[2rem] bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl overflow-hidden z-40">
            <div className="px-5 py-4">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <label htmlFor="mobile-search" className="sr-only">Recherche produits</label>
                <div className="relative">
                  <input
                    id="mobile-search"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="w-full border border-gray-200 rounded-full py-3 pl-4 pr-12 text-[11px] uppercase tracking-[0.25em] text-gray-600 focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black text-white p-2 flex items-center justify-center hover:bg-orange-500 transition-all"
                    aria-label="Rechercher"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
            <div className="px-5 pb-5 space-y-3 border-t border-gray-100">
              <NavLink to="/" className="block text-sm font-black uppercase tracking-[0.35em] text-gray-700 hover:text-black" onClick={() => setMobileMenuOpen(false)}>HOME</NavLink>
              <NavLink to="/shop" className="block text-sm font-black uppercase tracking-[0.35em] text-gray-700 hover:text-black" onClick={() => setMobileMenuOpen(false)}>SHOP</NavLink>
              {!session ? (
                <>
                  <NavLink to="/login" className="block text-sm font-black uppercase tracking-[0.35em] text-gray-700 hover:text-black" onClick={() => setMobileMenuOpen(false)}>CONNEXION</NavLink>
                  <NavLink to="/register" className="block text-sm font-black uppercase tracking-[0.35em] text-gray-700 hover:text-black" onClick={() => setMobileMenuOpen(false)}>S'INSCRIRE</NavLink>
                </>
              ) : (
                <>
                  {role === 'admin' && (
                    <NavLink to="/admin" className="block text-sm font-black uppercase tracking-[0.35em] text-red-600 hover:text-red-500" onClick={() => setMobileMenuOpen(false)}>ADMIN PANEL</NavLink>
                  )}
                  {role === 'vendeur' && (
                    <>
                      <NavLink to="/dashboard" className="block text-sm font-black uppercase tracking-[0.35em] text-gray-700 hover:text-black" onClick={() => setMobileMenuOpen(false)}>DASHBOARD</NavLink>
                      <NavLink to="/seller-orders" className="block text-sm font-black uppercase tracking-[0.35em] text-gray-700 hover:text-black" onClick={() => setMobileMenuOpen(false)}>MES VENTES</NavLink>
                    </>
                  )}
                  {role === 'client' && (
                    <NavLink to="/my-orders" className="block text-sm font-black uppercase tracking-[0.35em] text-gray-700 hover:text-black" onClick={() => setMobileMenuOpen(false)}>MES ACHATS</NavLink>
                  )}
                  <NavLink to="/notifications" className="block text-sm font-black uppercase tracking-[0.35em] text-gray-700 hover:text-black" onClick={() => setMobileMenuOpen(false)}>NOTIFICATIONS</NavLink>
                  <NavLink to="/cart" className="block text-sm font-black uppercase tracking-[0.35em] text-gray-700 hover:text-black" onClick={() => setMobileMenuOpen(false)}>PANIER ({totalItems})</NavLink>
                  
                  {/* NOM UTILISATEUR MOBILE */}
                  {username && (
                    <div className="px-3 py-2 bg-black text-white rounded-lg text-center">
                      <span className="text-sm font-black uppercase tracking-[0.35em]">{username}</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-sm font-black uppercase tracking-[0.35em] text-red-600 hover:text-red-500"
                  >
                    DÉCONNEXION
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}