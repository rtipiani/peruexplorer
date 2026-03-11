'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { locations } from '@/data/tourismData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { useEffect, useState } from 'react';
import { ArrowLeft, Mountain, Clock, ShieldCheck } from 'lucide-react';

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const location = locations.find(l => l.id === params.id);

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4 tracking-tighter italic uppercase text-slate-900">404_NOT_FOUND</h1>
          <button onClick={() => router.push('/')} className="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline">
            ← {t('nav.destinations')}
          </button>
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Immersive Exploration */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-slate-900 group">
        <Image 
          src={location.image} 
          alt={location.name}
          fill
          className="object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-[3000ms] scale-105 group-hover:scale-100"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30"></div>
        
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 pb-24 flex flex-col items-start">
          <button 
            onClick={() => router.back()}
            className="mb-12 flex items-center gap-4 text-slate-900 font-black text-[10px] uppercase tracking-[0.4em] group/back"
          >
            <ArrowLeft size={16} className="transition-transform group-hover/back:-translate-x-2" />
            {t('nav.back')}
          </button>
          
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.6em] mb-4 block">
            ARCHIVO_PERÚ_{location.id.toUpperCase()}
          </span>
          <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black text-slate-950 tracking-[-0.05em] leading-[0.85] italic mb-8">
            {location.name.split(' ')[0]} <br/>
            <span className="bronze-gradient not-italic">{location.name.split(' ').slice(1).join(' ')}</span>
          </h1>
        </div>
      </section>

      {/* Expedition Details Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto border-x border-slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          
          {/* Metadata Sidebar */}
          <div className="lg:col-span-4 space-y-16">
            <div className="p-10 border border-slate-900 bg-slate-900 text-white relative">
              <h3 className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-8">{t('admin.terminal')}</h3>
              
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3 text-white/50">
                    <Mountain size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('destinations.altitude')}</span>
                  </div>
                  <span className="text-sm font-black italic">{location.metadata.altitude}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3 text-white/50">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('destinations.difficulty')}</span>
                  </div>
                  <span className="text-sm font-black italic uppercase">{location.metadata.difficulty}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3 text-white/50">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('destinations.duration')}</span>
                  </div>
                  <span className="text-sm font-black italic uppercase">{location.metadata.duration}</span>
                </div>
              </div>
              
              <button className="w-full mt-12 py-5 bg-white text-slate-900 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary transition-all">
                {t('calendar.apply')}
              </button>
            </div>
            
            <div className="p-10 border border-slate-100 italic">
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                "{location.description}"
              </p>
            </div>
          </div>

          {/* Narrative Section */}
          <div className="lg:col-span-8">
            <header className="mb-16">
              <span className="w-16 h-2 bg-slate-900 block mb-10"></span>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{t('profile.archive')}</h2>
            </header>
            
            <article className="prose prose-slate prose-xl max-w-3xl">
              <p className="text-slate-600 font-medium leading-[1.8] text-xl mb-12 first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-slate-900">
                La experiencia en {location.name} trasciende lo meramente visual. Es un encuentro con la esencia natural y ancestral del Perú. Cada estrato geológico y cada piedra tallada cuenta una historia de miles de años que nuestro archivo ha documentado meticulosamente.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-16">
                <div className="aspect-square bg-slate-100 relative overflow-hidden group/detail">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover/detail:opacity-40 transition-opacity">
                      <span className="text-[10rem] font-black italic leading-none select-none uppercase">EXPEDITION</span>
                   </div>
                </div>
                <div className="aspect-square bg-slate-900 relative overflow-hidden group/detail">
                   <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                      <ShieldCheck size={120} strokeWidth={1} />
                   </div>
                </div>
              </div>

              <p className="text-slate-600 font-medium leading-[1.8] text-xl">
                 Nuestro equipo recomienda visitar durante los meses de {location.bestMonths.join(', ')} para capturar la luz en su estado más puro. La integración de {location.tags.join(' y ')} define la identidad de este sector del atlas peruano.
              </p>
            </article>

            {/* Verification Seal */}
            <div className="mt-24 pt-24 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-[10px] font-black italic">{t('destinations.verified').toUpperCase()}</div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('destinations.status').toUpperCase()}</div>
                    <div className="text-xs font-black text-slate-900 tracking-widest uppercase">{t('destinations.active').toUpperCase()}</div>
                  </div>
               </div>
               <div className="text-primary font-black text-[8px] uppercase tracking-[0.8em]">NETWORK_DE_EXPLORADORES</div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
