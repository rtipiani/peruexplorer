'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/i18n/LanguageContext";
import MemberLayout from "@/components/MemberLayout";
import { getUserNotifications, markNotificationsAsRead } from "@/lib/actions/post-actions";
import { Bell, ShieldAlert, ShieldCheck, Megaphone, Info } from "lucide-react";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoaded || !user) return;
      setIsLoading(true);
      
      const data = await getUserNotifications(user.id);
      setNotifications(data);
      
      // Marcar todas como leídas al entrar a la página
      await markNotificationsAsRead(user.id);
      
      setIsLoading(false);
    };

    fetchNotifications();
  }, [isLoaded, user]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PROFILE_REJECTED':
        return <ShieldAlert className="text-red-500" size={18} />;
      case 'PROFILE_APPROVED':
        return <ShieldCheck className="text-green-500" size={18} />;
      case 'POST_CREATED':
        return <Megaphone className="text-blue-500" size={18} />;
      default:
        return <Info className="text-slate-500" size={18} />;
    }
  };

  return (
    <MemberLayout activeItem="notificaciones">
      <div className="max-w-4xl mx-auto py-8">
        <header className="mb-6 flex items-center gap-2.5">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Bell size={12} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">Centro de Comunicaciones</h1>
            <p className="text-slate-500 text-[10px] mt-0.5">Historial de alertas, aprobaciones y mensajes del sistema.</p>
          </div>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-sm border border-white/5" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-dashed border-white/10 rounded-sm">
            <Bell size={32} className="mx-auto text-slate-700 mb-4 opacity-50" />
            <h2 className="text-lg font-bold text-white mb-2">Bandeja Vacía</h2>
            <p className="text-slate-500 text-xs tracking-widest">No tienes notificaciones por el momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any) => (
              <div 
                key={notif.id} 
                className={`p-4 rounded-sm border transition-colors flex gap-4 ${
                  !notif.isRead ? 'bg-slate-900/80 border-primary/30' : 'bg-slate-900/40 border-white/5'
                }`}
              >
                <div className="shrink-0 mt-1">
                  {getIconForType(notif.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold tracking-widest text-slate-500">
                      {new Date(notif.createdAt).toLocaleDateString()} &bull; {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed whitespace-pre-wrap font-normal">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
