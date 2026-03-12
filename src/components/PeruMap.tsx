'use client';

import { useEffect, useRef, useState } from 'react';
import { Location } from '@/data/tourismData';
import { MapPin, X, Clock, Mountain, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PeruMapProps {
  locations: Location[];
}

export default function PeruMap({ locations }: PeruMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selected, setSelected] = useState<Location | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Evitar doble inicialización (React Strict Mode / hot reload)
    const container = mapRef.current as any;
    if (container._leaflet_id) return;

    // Importar Leaflet dinámicamente (sólo client-side)
    import('leaflet').then((L) => {
      if (!mapRef.current) return;
      const el = mapRef.current as any;
      if (el._leaflet_id) return; // segunda verificación por import async

      // Fix default icon paths para Next.js / Webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Crear el mapa centrado en Perú
      const map = L.map(mapRef.current!, {
        center: [-9.5, -74.0],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
      });

      // Tile oscuro de CartoDB (se integra perfectamente con el tema)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap ©CartoDB',
        maxZoom: 19,
      }).addTo(map);

      // Añadir control de zoom en posición personalizada
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.attribution({ position: 'bottomleft', prefix: '' }).addTo(map);

      // Icono personalizado bronce para los marcadores
      const createCustomIcon = (active = false) => L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px;
            background: ${active ? '#ffffff' : '#A68D5B'};
            border: 2px solid ${active ? '#A68D5B' : 'rgba(255,255,255,0.2)'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 20px rgba(166,141,91,0.4);
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="
              position: absolute; inset: 6px;
              background: ${active ? '#A68D5B' : 'rgba(0,0,0,0.3)'};
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      // Agregar marcadores para cada destino
      locations.forEach((location) => {
        const marker = L.marker(
          [location.coordinates.lat, location.coordinates.lng],
          { icon: createCustomIcon() }
        ).addTo(map);

        marker.on('click', () => {
          setSelected(location);
          map.flyTo([location.coordinates.lat, location.coordinates.lng], 9, {
            animate: true, duration: 1.2
          });
        });

        // Tooltip con el nombre
        marker.bindTooltip(`
          <div style="
            background:#0a0a0a; border:1px solid rgba(166,141,91,0.4);
            color:#fff; font-size:10px; font-weight:900;
            letter-spacing:0.15em; text-transform:uppercase;
            padding:6px 12px; border-radius:2px;
          ">${location.name}</div>
        `, { 
          permanent: false, direction: 'top', offset: [0, -40],
          className: 'leaflet-dark-tooltip'
        });
      });

      mapInstanceRef.current = map;
      setIsLoaded(true);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Mapa */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-primary animate-spin rounded-full" />
            <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">Cargando mapa...</span>
          </div>
        </div>
      )}

      {/* Panel de detalle del destino seleccionado */}
      {selected && (
        <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-80 z-[1000] animate-in slide-in-from-left duration-300">
          <div className="bg-black/95 border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-md overflow-hidden rounded-sm">
            {/* Header con imagen */}
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={selected.image}
                alt={selected.name}
                fill
                className="object-cover grayscale-[0.3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-7 h-7 bg-black/70 hover:bg-black border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all backdrop-blur-sm"
              >
                <X size={13} />
              </button>
              <div className="absolute bottom-0 left-0 p-4">
                <div className="text-[8px] font-black text-primary tracking-[0.4em] uppercase mb-1">{selected.region}</div>
                <h3 className="text-xl font-black text-white tracking-tighter leading-none italic">{selected.name}</h3>
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <p className="text-slate-400 text-xs leading-relaxed font-medium mb-5">
                {selected.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/5 p-3 rounded-sm border border-white/5">
                  <div className="text-[8px] font-black text-slate-600 tracking-widest uppercase mb-1 flex items-center gap-1"><Mountain size={9} /> Altitud</div>
                  <div className="text-sm font-black text-white">{selected.metadata.altitude}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-sm border border-white/5">
                  <div className="text-[8px] font-black text-slate-600 tracking-widest uppercase mb-1 flex items-center gap-1"><Clock size={9} /> Duración</div>
                  <div className="text-sm font-black text-white">{selected.metadata.duration}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {selected.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/5 border border-white/5 text-[8px] font-black text-primary tracking-widest uppercase rounded-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/destinos/${selected.id}`}
                className="w-full flex items-center justify-between px-4 py-3 bg-primary text-slate-900 font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all group"
              >
                Ver destino completo
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-16 sm:bottom-8 left-4 z-[1000]">
        <div className="bg-black/80 border border-white/5 backdrop-blur-md px-4 py-2 sm:py-3 flex items-center gap-3">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary border border-white/20" />
          <span className="text-[8px] sm:text-[9px] font-black text-slate-500 tracking-widest uppercase">{locations.length} Destinos activos</span>
        </div>
      </div>
    </div>
  );
}
