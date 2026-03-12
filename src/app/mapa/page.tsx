'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import MemberLayout from '@/components/MemberLayout';
import { getLocations } from '@/app/actions/locationActions';
import { calculateDistance } from '@/data/tourismData';
import { Search, MapPin, Navigation, Compass, RefreshCw } from 'lucide-react';

// Importar el mapa de forma dinámica (no SSR)
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
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [dbLocations, setDbLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar destinos de la base de datos
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

  // Detectar ubicación del usuario al cargar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => console.log('El usuario denegó el acceso al GPS')
      );
    }
  }, []);

  // Calcular distancias y filtrar destinos
  const processedLocations = useMemo(() => {
    let result = dbLocations.map(loc => {
      let distance: number | undefined;
      if (userLocation) {
        distance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          loc.latitude, 
          loc.longitude
        );
      }
      return { ...loc, distance };
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        loc.region.toLowerCase().includes(q)
      );
    }

    // Ordenar por proximidad si hay ubicación del usuario
    if (userLocation) {
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return result;
  }, [userLocation, searchQuery, dbLocations]);

  // Manejar el resaltado cuando se busca algo específico y hay solo un resultado
  useEffect(() => {
    if (searchQuery.trim() && processedLocations.length === 1) {
      setHighlightedId(processedLocations[0].id);
    } else {
      setHighlightedId(null);
    }
  }, [searchQuery, processedLocations]);

  return (
    <MemberLayout activeItem="mapa">
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        {/* Header con Buscador */}
        <div className="pb-6 mb-6 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
                {userLocation ? 'GPS ACTIVADO' : 'Geolocalización'}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter italic">
              Expediciones <span className="bronze-gradient not-italic">Cercanas</span>
            </h2>
          </div>

          <div className="relative flex-grow max-w-lg group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Busca por nombre o región (ej: Cusco, Ancash...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-sm py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all shadow-2xl"
            />
            {userLocation && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Navigation size={12} className="text-primary animate-pulse" />
                <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Cerca de ti</span>
              </div>
            )}
          </div>

          <div className="hidden lg:flex flex-col items-end flex-shrink-0">
            <div className="text-[10px] font-black text-slate-600 tracking-widest uppercase mb-1">Resultados</div>
            <div className="text-2xl font-black text-primary">{processedLocations.length}</div>
          </div>
        </div>

        {/* Mapa a pantalla completa */}
        <div className="flex-1 border border-white/5 overflow-hidden relative rounded-sm group/map shadow-inner">
          <PeruMap 
            locations={processedLocations} 
            userLocation={userLocation || undefined}
            highlightedLocationId={highlightedId}
          />
          
          {/* Brújula decorativa */}
          <div className="absolute top-6 right-6 z-20 opacity-20 pointer-events-none group-hover/map:opacity-40 transition-opacity">
            <Compass size={80} className="text-white animate-[spin_20s_linear_infinite]" strokeWidth={1} />
          </div>
        </div>

        {/* Listado rápido de regiones */}
        <div className="pt-4 flex items-center gap-6 overflow-x-auto no-scrollbar">
          {['Cusco', 'Ancash', 'Arequipa', 'Loreto', 'Puno', 'Ica'].map(region => (
            <button 
              key={region} 
              onClick={() => setSearchQuery(region)}
              className={`text-[9px] font-black tracking-widest uppercase transition-colors whitespace-nowrap ${searchQuery.toLowerCase() === region.toLowerCase() ? 'text-primary underline underline-offset-8' : 'text-slate-700 hover:text-slate-400'}`}
            >
              {region}
            </button>
          ))}
          <div className="ml-auto hidden sm:block text-[9px] font-black text-slate-800 tracking-widest uppercase">
            Sistema de Proximidad · Perú Explorer v2.0
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
