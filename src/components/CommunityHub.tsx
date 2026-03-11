'use client';

import { Suspense, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import PostCreator from "@/components/PostCreator";
import PostSkeleton from "@/components/PostSkeleton";
import { useLanguage } from "@/i18n/LanguageContext";
import { Shield, Map as MapIcon, Award, Zap, X } from "lucide-react";
import { getPosts } from "@/lib/actions/post-actions";
import { locations } from "@/data/tourismData";

export default function CommunityHub() {
  const { t } = useLanguage();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locationParam = searchParams.get('location');

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const loadPosts = async (locFilter?: string) => {
    try {
      setLoading(true);
      setDebugInfo(null);
      const result: any = await getPosts(locFilter, user?.id);
      
      console.log(`Feed Debug: Received data`, result);
      if (result && Array.isArray(result.posts)) {
        setPosts(result.posts);
        const logMsg = `DB Total: ${result.totalInDb} | Feed: ${result.posts.length} | DB URL: ${result.dbPrefix}...`;
        setDebugInfo(logMsg);
      } else {
        console.error("Feed Debug: Data structure unknown", result);
        setDebugInfo("Error: Unexpected data structure from server");
      }
    } catch (e: any) {
      console.error("Posts load error", e);
      setDebugInfo(`Error loading: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(locationParam || undefined);

    // Listen for new/updated/deleted posts
    const handleRefresh = () => loadPosts(locationParam || undefined);
    window.addEventListener('px_new_post', handleRefresh);
    window.addEventListener('px_post_updated', handleRefresh);
    
    return () => {
      window.removeEventListener('px_new_post', handleRefresh);
      window.removeEventListener('px_post_updated', handleRefresh);
    };
  }, [locationParam]);

  const clearFilter = () => {
    router.push('/');
  };

  const announcements = [
    { id: 1, title: "Expedición Q'eswachaka 2026", date: "15 Mar", type: "Evento" },
    { id: 2, title: "Alerta: Clima en Cordillera Blanca", date: "Hoy", type: "Clima" }
  ];

  const recommendations = [
    { id: 1, title: "Cena en Central", desc: "Reserva con 4 meses de antelación.", category: "Gastro" },
    { id: 2, title: "Ruta Ausangate", desc: "Nivel experto. Solo con guía verificado.", category: "Trekking" }
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?q=80&w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1483190656465-2c49e54d29f3?q=80&w=400&h=400&fit=crop",
  ];

  return (
    <div className="space-y-12">
      {!locationParam && <PostCreator />}
      
      {locationParam && (
        <div className="flex items-center justify-between p-6 bg-primary/10 border border-primary/20 rounded-sm animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full text-primary">
              <MapIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-1">Filtrando por ubicación</p>
              <h3 className="text-xl font-black text-white italic tracking-tight">{locationParam}</h3>
            </div>
          </div>
          <button 
            onClick={clearFilter}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      )}

      <div className="space-y-0 border-t border-white/5">
        {loading ? (
          [1,2,3].map(i => <PostSkeleton key={i} />)
        ) : posts.length > 0 ? (
          posts.map(post => {
            let timeDisplay = "Reciente";
            if (post.created_at) {
              const date = new Date(post.created_at);
              timeDisplay = date.toLocaleString('es-PE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              });
            }
            return (
              <PostCard 
                key={post.id}
                postId={post.id}
                postUserId={post.userId || ''}
                user={{
                  name: post.user_name,
                  avatar: post.user_avatar || "",
                  location: post.location || "Perú"
                }}
                content={post.content}
                image={post.image_url}
                timestamp={timeDisplay}
                isEdited={post.updated_at !== post.created_at}
                reactions={post.reactions || { loves: 0, comments: 0 }}
                isPromoted={post.isPromoted}
                initiallyLiked={post.likedByUser ?? false}
              />
            );
          })
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="text-slate-700 font-bold italic tracking-widest uppercase text-xs">
              No hay expediciones registradas aún.
            </div>
            {debugInfo && (
              <div className="text-[10px] text-slate-500 font-mono">
                Log: {debugInfo}
              </div>
            )}
            <button 
              onClick={() => loadPosts(locationParam || undefined)}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-sm text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest"
            >
              Reintentar Conexión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
