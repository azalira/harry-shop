import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Chargement initial
    fetchNotifications();

    // 2. ÉCOUTE EN TEMPS RÉEL (Supabase Realtime)
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}` 
          }, 
          (payload) => {
            // On ajoute la nouvelle notification en haut de la liste
            setNotifications(prev => [payload.new, ...prev]);
          }
        )
        .subscribe();

      return channel;
    };

    const channelRef = setupSubscription();

    // Nettoyage de l'écouteur quand on quitte la page
    return () => {
      channelRef.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Erreur inbox:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    }
  }

  async function deleteAll() {
    if (!window.confirm("Tout effacer ?")) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id);

    if (!error) setNotifications([]);
  }

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh] font-black uppercase italic tracking-widest animate-pulse">
      Initialisation du flux...
    </div>
  );

  return (
    <div className="max-w-[800px] mx-auto px-6 py-16 mb-20">
      <div className="flex justify-between items-end mb-12 border-b-4 border-black pb-6">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter">
          Inbox <span className="text-orange-500">Alerts</span>
        </h1>
        {notifications.length > 0 && (
          <button 
            onClick={deleteAll}
            className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 px-2 py-1 transition-colors"
          >
            Vider l'archive
          </button>
        )}
      </div>

      <div className="space-y-8">
        {notifications.length === 0 ? (
          <div className="border-4 border-dashed border-gray-100 py-32 text-center">
            <p className="text-gray-300 font-black uppercase text-sm italic tracking-widest">
              Silence radio.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`relative p-8 transition-all duration-300 border-2 ${
                n.is_read 
                ? 'border-gray-200 bg-gray-50 opacity-50 grayscale' 
                : 'border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[14px_14px_0px_0px_rgba(255,100,0,1)]'
              }`}
            >
              {!n.is_read && (
                <div className="absolute -top-3 -left-3 bg-orange-600 text-white text-[9px] font-black px-3 py-1 uppercase italic z-10 shadow-md">
                  Nouveau
                </div>
              )}
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-black text-white">
                      {n.type || 'Système'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
                      {new Date(n.created_at).toLocaleTimeString()} — {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-black uppercase leading-tight mb-2 tracking-tight">
                    {n.title}
                  </h2>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {!n.is_read && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    className="shrink-0 bg-black text-white text-[10px] font-black uppercase px-6 py-3 hover:bg-orange-600 transition-all active:scale-95"
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}