'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from "@clerk/nextjs";
import { useLanguage } from '@/i18n/LanguageContext';
import { getUnreadNotificationsCount, markNotificationsAsRead, getUserNotifications } from '@/lib/actions/post-actions';
import { 
  LayoutDashboard, 
  Map, 
  Archive, 
  Inbox, 
  Search, 
  Settings, 
  Compass,
  ChevronRight,
  ShieldCheck,
  Bell,
  Megaphone,
  RefreshCw
} from 'lucide-react';

interface MemberLayoutProps {
  children: ReactNode;
  activeItem?: string;
}

export default function MemberLayout({ children, activeItem = 'feed' }: MemberLayoutProps) {
  const { t, locale } = useLanguage();
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      const count = await getUnreadNotificationsCount(user.id);
      setUnreadCount(count);
    };

    if (user) {
      fetchNotifications();
    }
    
    // Escuchar el evento personalizado de nuevo post para actualizar el badge localmente
    const handleNewPost = () => fetchNotifications();
    window.addEventListener('px_new_post', handleNewPost);
    return () => window.removeEventListener('px_new_post', handleNewPost);
  }, []);

  const handleMarkAsRead = async () => {
    if (!user) return;
    await markNotificationsAsRead(user.id);
    setUnreadCount(0);
  };

  const toggleNotifications = async () => {
    if (!showNotifications && user) {
      setIsLoadingNotifs(true);
      setShowNotifications(true);
      const data = await getUserNotifications(user.id);
      setRecentNotifications(data.slice(0, 5));
      setIsLoadingNotifs(false);
      // Opcional: marcar como leídas al abrir el preview
      if (unreadCount > 0) {
        handleMarkAsRead();
      }
    } else {
      setShowNotifications(false);
    }
  };

  const navItems = [
    { id: 'feed', icon: <LayoutDashboard size={20} />, label: t('nav_auth.feed'), href: '/' },
    { id: 'mapa', icon: <Compass size={20} />, label: t('nav_auth.map'), href: '/mapa' },
    { id: 'destinos', icon: <Archive size={20} />, label: t('nav.destinations'), href: '/destinos' },
    { id: 'expediciones', icon: <Map size={20} />, label: t('nav_auth.expeditions'), href: '/planificar' },
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      {/* Sidebar - FIXED */}
      <aside className="w-72 bg-slate-950 flex flex-col border-r border-white/5 relative z-30">
        <div className="p-8">
          <Link href="/" className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            PERU<span className="text-primary italic">X</span>
          </Link>
          <div className="mt-2 text-[8px] font-black text-slate-700 tracking-widest">Operation Network // 2026</div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="text-[10px] font-black text-slate-700 tracking-[0.3em] px-4 mb-6">Main Grid</div>
          {navItems.map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-sm transition-all group ${activeItem === item.id ? 'bg-primary text-slate-900 font-bold' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
            >
              <span className={`${activeItem === item.id ? 'text-slate-900' : 'text-slate-700 group-hover:text-primary transition-colors'}`}>
                {item.icon}
              </span>
              <span className="text-[11px] font-bold tracking-widest">{item.label}</span>
              {activeItem === item.id && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}

          <div className="pt-10">
            <div className="text-[10px] font-black text-slate-700 tracking-[0.3em] px-4 mb-6">Intelligence</div>
            <Link href="#" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:text-white transition-all group">
              <span className="text-slate-700 group-hover:text-primary transition-colors"><Inbox size={20} /></span>
              <span className="text-[11px] font-bold tracking-widest">Mensajes</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
            </Link>
            <Link href="#" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:text-white transition-all group">
              <span className="text-slate-700 group-hover:text-primary transition-colors"><Settings size={20} /></span>
              <span className="text-[11px] font-bold tracking-widest">Configuración</span>
            </Link>
          </div>
        </nav>

        <div className="p-8 border-t border-white/5 bg-black/20">
           <div className="flex flex-col gap-1">
              <div className="text-[8px] font-black text-slate-700 tracking-[0.2em] uppercase">System Identity</div>
              <div className="text-[10px] font-bold text-slate-400">Node_Explorer_v1.0</div>
           </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-20 bg-black border-b border-white/5 flex items-center relative z-20">
          <div className="max-w-[1400px] mx-auto w-full flex justify-center gap-16 px-10">
            {/* Buscador - Alineado con el feed */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search nodes, posts or files..." 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-sm py-2.5 pl-12 pr-6 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-500 border border-white/20 px-1.5 py-0.5 rounded-sm bg-black/50">⌘K</div>
              </div>
            </div>

            {/* Control Hub - Alineado con Publicidad */}
            <div className="hidden lg:flex w-64 items-center justify-end gap-5">
                <div className="flex gap-2 relative">
                  <div className="relative">
                    <button 
                     onClick={toggleNotifications}
                     className={`w-9 h-9 rounded-sm border flex items-center justify-center transition-all group/bell ${showNotifications ? 'bg-primary text-slate-900 border-primary' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`} 
                     title="Notificaciones"
                    >
                       <Bell size={16} className={unreadCount > 0 ? (showNotifications ? 'text-slate-900' : 'text-primary fill-primary/10') : (showNotifications ? 'text-slate-900' : 'group-hover/bell:text-primary transition-colors')} />
                       {unreadCount > 0 && !showNotifications && (
                         <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[8px] font-black text-slate-900 flex items-center justify-center border-2 border-black animate-in zoom-in duration-300">
                           {unreadCount > 9 ? '+9' : unreadCount}
                         </div>
                       )}
                    </button>

                    {/* Dropdown Popover */}
                    {showNotifications && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowNotifications(false)} 
                        />
                        <div className="absolute right-0 mt-3 w-80 bg-slate-950 border border-white/10 rounded-sm shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                            <span className="text-[10px] font-black tracking-widest text-slate-400">Recientes</span>
                            <Link 
                             href="/notificaciones" 
                             onClick={() => setShowNotifications(false)}
                             className="text-[9px] font-bold text-primary hover:underline tracking-tighter"
                            >
                              Ver todas
                            </Link>
                          </div>
                          
                          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {isLoadingNotifs ? (
                              <div className="p-10 text-center">
                                <RefreshCw size={20} className="animate-spin text-slate-700 mx-auto" />
                              </div>
                            ) : recentNotifications.length === 0 ? (
                              <div className="p-10 text-center">
                                <Bell size={30} className="text-slate-800 mx-auto mb-3 opacity-20" />
                                <p className="text-[10px] font-medium text-slate-600 tracking-widest">Sin actividad</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-white/5">
                                {recentNotifications.map((n) => (
                                  <Link 
                                    key={n.id} 
                                    href="/notificaciones"
                                    onClick={() => setShowNotifications(false)}
                                    className="block p-4 hover:bg-white/[0.02] transition-colors group/item"
                                  >
                                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed group-hover/item:text-white transition-colors">
                                      {n.message}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                      <div className={`w-1 h-1 rounded-full ${n.type === 'PROFILE_REJECTED' ? 'bg-red-500' : 'bg-primary'}`} />
                                      <span className="text-[8px] font-bold text-slate-600 tracking-tighter">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <Link href="/professional" className="w-9 h-9 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 relative hover:text-white hover:bg-white/10 cursor-pointer transition-all group/pro" title="Panel Profesional">
                     <Megaphone size={16} className="group-hover/pro:text-primary transition-colors" />
                  </Link>
                </div>

               {/* User Context */}
               <div className="pl-2 border-l border-white/10 flex items-center gap-3">
                 <div className="flex flex-col items-end hidden sm:flex">
                    <div className="text-[9px] font-black text-white tracking-tight leading-none mb-0.5 uppercase truncate max-w-[120px]">
                      {user?.fullName || user?.username || 'Explorer'}
                    </div>
                    <div className="text-[8px] font-bold text-primary tracking-widest uppercase truncate max-w-[100px]">
                      @{user?.username || 'member'}
                    </div>
                 </div>
                 <div className="scale-90 border border-white/20 rounded-full p-0.5 hover:border-primary/50 transition-colors">
                    <UserButton />
                 </div>
               </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-black custom-scrollbar relative">
          <div className="p-10 pb-32">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
