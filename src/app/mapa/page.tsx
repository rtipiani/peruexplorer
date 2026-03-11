'use client';

import dynamic from 'next/dynamic';
import MemberLayout from '@/components/MemberLayout';
import { locations } from '@/data/tourismData';

// Importar el mapa de forma dinámica (no SSR, Leaflet requiere window)
const PeruMap = dynamic(() => import('@/components/PeruMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-slate-800 border-t-primary animate-spin rounded-full" />
        <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">Inicializando mapa...</span>
      </div>
    </div>
  )
});

export default function MapaPage() {
  return (
    <MemberLayout activeItem="mapa">
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        {/* Header */}
        <div className="pb-6 mb-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Geolocalización</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter italic">
              Mapa de <span className="bronze-gradient not-italic">Expediciones</span>
            </h2>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-600 tracking-widest uppercase mb-1">Destinos activos</div>
            <div className="text-2xl font-black text-primary">{locations.length}</div>
          </div>
        </div>

        {/* Mapa a pantalla completa */}
        <div className="flex-1 border border-white/5 overflow-hidden relative rounded-sm">
          <PeruMap locations={locations} />
        </div>

        {/* Footer stats */}
        <div className="pt-4 flex items-center gap-8">
          {['Cusco', 'Ancash', 'Arequipa', 'Loreto', 'Puno'].map(region => (
            <div key={region} className="text-[9px] font-black text-slate-700 tracking-widest uppercase hover:text-primary transition-colors cursor-default">
              {region}
            </div>
          ))}
          <div className="ml-auto text-[9px] font-black text-slate-700 tracking-widest uppercase">
            © OpenStreetMap · CartoDB
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
