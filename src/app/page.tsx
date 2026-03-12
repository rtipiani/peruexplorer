'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import LocationCard from "@/components/LocationCard";
import TravelCalendar from "@/components/TravelCalendar";
import CommunityHub from "@/components/CommunityHub";
import MemberLayout from "@/components/MemberLayout";
import SponsoredSidebar from "@/components/SponsoredSidebar";
import { locations } from "@/data/tourismData";
import { useLanguage } from '@/i18n/LanguageContext';
import { useMemo } from 'react';
import { MapPin, Star } from 'lucide-react';

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { t } = useLanguage();

  const { featuredDestination, otherDestinations } = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const inSeason = locations.filter(loc => loc.bestMonths.includes(currentMonth));
    const pool = inSeason.length > 0 ? inSeason : locations;
    const featuredIndex = Math.floor(Math.random() * pool.length);
    const featured = pool[featuredIndex];
    // Otros 2 destinos (distintos al destacado)
    const rest = locations.filter(loc => loc.id !== featured.id);
    const shuffled = rest.sort(() => 0.5 - Math.random()).slice(0, 2);
    return { featuredDestination: featured, otherDestinations: shuffled };
  }, []);

  if (!isLoaded) return null; // O un componente de carga premium

  if (isSignedIn) {
    return (
      <MemberLayout>
        <div className="flex flex-col lg:flex-row gap-16 justify-center max-w-[1400px] mx-auto">
          {/* COLUMNA IZQUIERDA: Feed (Alineado con buscador max-w-2xl) */}
          <div className="flex-1 max-w-2xl space-y-10">
            {/* Feed Header */}
            <div className="pb-8 border-b border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Live Community</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter italic">
                Red de <span className="bronze-gradient not-italic">Exploradores</span>
              </h2>
            </div>

            {/* Social Feed */}
            <CommunityHub />
          </div>

          {/* COLUMNA DERECHA: Publicidad / Inteligencia Adicional */}
          <aside className="hidden xl:block w-64 sticky top-10 h-[calc(100vh-2.5rem)] overflow-y-auto space-y-8 scrollbar-none pb-10" style={{ scrollbarWidth: 'none' }}>
             <SponsoredSidebar />

             {/* Destino Recomendado del Mes */}
             <Link href={`/destinos`} className="block border border-white/5 bg-black p-1 rounded-sm group">
                <div className="aspect-[4/5] bg-slate-900 overflow-hidden relative">
                  <img 
                    src={featuredDestination.image} 
                    alt={featuredDestination.name}
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-5 right-5">
                    <span className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mb-2 block">Destino del Mes</span>
                    <h5 className="text-base font-black text-white italic leading-tight tracking-tighter mb-1">
                      {featuredDestination.name}
                    </h5>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={8} className="text-primary" />
                        <span className="text-[8px] text-slate-400 font-medium">{featuredDestination.region}</span>
                      </div>
                      <span className={`text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${
                        featuredDestination.metadata.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10' :
                        featuredDestination.metadata.difficulty === 'Moderate' ? 'text-yellow-400 bg-yellow-400/10' :
                        featuredDestination.metadata.difficulty === 'Challenging' ? 'text-orange-400 bg-orange-400/10' :
                        'text-red-400 bg-red-400/10'
                      }`}>
                        {featuredDestination.metadata.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
             </Link>

             {/* Otros destinos destacados */}
             <div className="space-y-2">
               <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em] px-1 block">También te puede interesar</span>
               {otherDestinations.map((dest) => (
                 <Link key={dest.id} href="/destinos" className="group flex flex-col gap-1.5 border border-white/5 hover:border-primary/30 bg-slate-900/30 hover:bg-slate-900/60 p-4 rounded-sm transition-all">
                   <div className="flex items-start justify-between gap-2">
                     <h6 className="text-[11px] font-black text-white italic leading-tight tracking-tighter group-hover:text-primary transition-colors">
                       {dest.name}
                     </h6>
                     <span className={`shrink-0 text-[6px] font-bold uppercase tracking-wider px-1 py-0.5 ${
                       dest.metadata.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10' :
                       dest.metadata.difficulty === 'Moderate' ? 'text-yellow-400 bg-yellow-400/10' :
                       dest.metadata.difficulty === 'Challenging' ? 'text-orange-400 bg-orange-400/10' :
                       'text-red-400 bg-red-400/10'
                     }`}>
                       {dest.metadata.difficulty}
                     </span>
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1">
                       <MapPin size={7} className="text-primary/60" />
                       <span className="text-[8px] text-slate-500">{dest.region}</span>
                     </div>
                     <div className="flex items-center gap-2 text-[7px] text-slate-600">
                       <span>{dest.metadata.altitude}</span>
                       <span className="text-slate-700">·</span>
                       <span>{dest.metadata.duration}</span>
                     </div>
                   </div>
                 </Link>
               ))}
             </div>

             {/* Footer Lateral Minimalista */}
             <div className="px-4 py-6 border-t border-white/5">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                   <a href="#" className="hover:text-slate-400">Privacidad</a>
                   <a href="#" className="hover:text-slate-400">Términos</a>
                   <a href="#" className="hover:text-slate-400">Cookies</a>
                </div>
                <div className="mt-6 text-[8px] font-black text-slate-800 tracking-tighter uppercase">
                   Peru Explorer Network © 2026
                </div>
             </div>
          </aside>
        </div>
      </MemberLayout>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      
      {/* Destinations Section */}
      <section id="lugares" className="section-padding px-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 lg:mb-32 gap-8 lg:gap-12">
          <div className="max-w-3xl">
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] mb-4 block">{t('destinations.selection')}</span>
            <h2 className="text-4xl md:text-7xl font-black mb-6 lg:mb-10 tracking-[-0.05em] text-white leading-[0.85] italic">
              {t('destinations.title')} <br/>
              <span className="bronze-gradient not-italic">{t('destinations.legendary')}</span>
            </h2>
            <div className="w-16 lg:w-24 h-1.5 lg:h-2 bg-primary mb-8 lg:mb-10"></div>
            <p className="text-slate-500 text-lg lg:text-xl font-medium leading-relaxed tracking-tight max-w-xl">
              {t('destinations.description')}
            </p>
          </div>
          <Link 
            href="/destinos"
            className="w-full md:w-auto px-10 py-4 rounded-sm border border-white/10 text-white font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black hover:border-white text-center transition-all group"
          >
            {t('destinations.viewAll')} <span className="inline-block transform group-hover:translate-x-1 transition-transform ml-2">→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 p-px border border-white/5">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      </section>

      {/* Travel Calendar Section - Integrated seamlessly */}
      <TravelCalendar />

      <Footer />
    </main>
  );
}
