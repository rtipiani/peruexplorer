'use client';

import { getLocations } from '@/app/actions/locationActions';
import { useLanguage } from '@/i18n/LanguageContext';
import { MapPin, ArrowRight, Compass, Star, Zap, RefreshCw } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function RegionExplorer() {
  const { t } = useLanguage();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [dbLocations, setDbLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      const res = await getLocations();
      if (res.success) {
        setDbLocations(res.data);
      }
      setIsLoading(false);
    };
    fetchLocations();
  }, []);

  // Group locations by region
  const regions = useMemo(() => {
    return Array.from(new Set(dbLocations.map(loc => loc.region)));
  }, [dbLocations]);

  const filteredLocations = useMemo(() => {
    return activeRegion 
      ? dbLocations.filter(loc => loc.region === activeRegion)
      : dbLocations;
  }, [activeRegion, dbLocations]);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center border-t border-white/5">
        <RefreshCw className="animate-spin text-primary mb-4" size={32} />
        <span className="text-[10px] font-black text-slate-500 tracking-[0.5em] uppercase">Sincronizando Atlas Regional...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Regions Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-primary mb-4">
             <Compass size={18} className="animate-spin-slow" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">Global Navigation</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic leading-none">
            Explora por <span className="bronze-gradient not-italic">Departamentos</span>
          </h2>
          <p className="mt-6 text-slate-500 font-medium text-base tracking-tight leading-relaxed max-w-lg">
            Descubre los tesoros ocultos en cada rincón del Perú, desde las costas del Pacífico hasta las profundidades de la Amazonía.
          </p>
        </div>

        {/* Region Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveRegion(null)}
            className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${!activeRegion ? 'bg-primary text-slate-900 shadow-xl shadow-primary/10' : 'bg-white/5 text-slate-500 hover:text-white border border-white/5'}`}
          >
            TODOS
          </button>
          {regions.sort().map(region => (
            <button 
              key={region} 
              onClick={() => setActiveRegion(region)}
              className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${activeRegion === region ? 'bg-primary text-slate-900 shadow-xl shadow-primary/10' : 'bg-white/5 text-slate-500 hover:text-white border border-white/5'}`}
            >
              {region.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Exploration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLocations.map((loc) => (
          <div key={loc.id} className="group relative overflow-hidden bg-slate-900 border border-white/5 aspect-[4/5] shadow-2xl transition-all duration-700 flex flex-col rounded-sm">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 overflow-hidden">
               <img 
                 src={loc.image} 
                 alt={loc.name} 
                 className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90" />
            </div>

            {/* Badge */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
               <div className="px-3 py-1 bg-primary/90 backdrop-blur-md text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-sm flex items-center gap-1.5">
                  <Zap size={10} className="fill-slate-950" /> PREMIUM
               </div>
            </div>

            {/* Content Container */}
            <div className="mt-auto p-6 relative z-10 w-full transform group-hover:translate-y-[-8px] transition-transform duration-500">
               <div className="flex items-center gap-2 text-primary mb-2">
                  <MapPin size={12} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{loc.region}</span>
               </div>
               
               <h3 className="text-2xl font-black text-white tracking-tighter italic mb-4 group-hover:text-primary transition-colors leading-none">
                 {loc.name}
               </h3>
               
               {/* Metadata compact but readable */}
               <div className="flex justify-between items-center pt-5 border-t border-white/10">
                  <div className="flex gap-4">
                     <div className="flex flex-col">
                        <span className="text-slate-600 text-[8px] font-black tracking-widest uppercase">Altitud</span>
                        <span className="text-white text-[10px] font-bold tracking-tight">{loc.altitude}</span>
                     </div>
                     <div className="flex flex-col border-l border-white/5 pl-4">
                        <span className="text-slate-600 text-[8px] font-black tracking-widest uppercase">Nivel</span>
                        <span className="text-white text-[10px] font-bold tracking-tight">{loc.difficulty}</span>
                     </div>
                  </div>

                  <Link 
                    href={`/lugares/${loc.id}`}
                    className="w-9 h-9 rounded-sm bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-slate-900 transition-all group/btn"
                  >
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>

            {/* Hover visual effect */}
            <div className="absolute top-0 left-0 w-full h-0.5 bronze-gradient transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
          </div>
        ))}

        {filteredLocations.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-sm">
             <Compass size={48} className="mx-auto text-white/5 mb-6" />
             <p className="text-slate-600 font-bold tracking-widest uppercase text-xs">Sin registros en esta región</p>
          </div>
        )}
      </div>
    </div>
  );
}
