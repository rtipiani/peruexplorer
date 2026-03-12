'use client';

import { useEffect, useRef, useState } from 'react';
import { Location } from '@/data/tourismData';
import { MapPin, X, Clock, Mountain, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PeruMapProps {
  locations: (Location & { distance?: number })[];
  userLocation?: { lat: number; lng: number };
  highlightedLocationId?: string | null;
}

export default function PeruMap({ locations, userLocation, highlightedLocationId }: PeruMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);
  const [selected, setSelected] = useState<(Location & { distance?: number }) | null>(null);
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

        markersRef.current[location.id] = marker;

        marker.on('click', () => {
          setSelected(location);
          map.flyTo([location.coordinates.lat, location.coordinates.lng], 9, {
            animate: true, duration: 1.2
          });
        });

        // Tooltip con el nombre y distancia
        const distanceText = location.distance 
          ? `<div style="color:#A68D5B; margin-top:2px;">A ${location.distance.toFixed(1)} km de ti</div>`
          : '';

        marker.bindTooltip(`
          <div style="
            background:#0a0a0a; border:1px solid rgba(166,141,91,0.4);
            color:#fff; font-size:10px; font-weight:900;
            letter-spacing:0.15em; text-transform:uppercase;
            padding:6px 12px; border-radius:2px;
            text-align: center;
          ">
            <div>${location.name}</div>
            ${distanceText}
          </div>
        `, { 
          permanent: false, direction: 'top', offset: [0, -40],
          className: 'leaflet-dark-tooltip'
        });
      });

      // Marcador de Ubicación del Usuario
      if (userLocation) {
        const userIcon = L.divIcon({
          className: '',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
              <div class="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      }

      mapInstanceRef.current = map;
      setIsLoaded(true);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Efecto para geolocalización dinámica y centrado
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    
    // Actualizar o crear marcador de usuario
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      import('leaflet').then((L) => {
        const userIcon = L.divIcon({
          className: '',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
              <div class="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
      });
    }
  }, [userLocation]);

  // Efecto para resaltar destino buscado
  useEffect(() => {
    if (!mapInstanceRef.current || !highlightedLocationId) return;
    
    const location = locations.find(l => l.id === highlightedLocationId);
    if (location) {
      setSelected(location);
      mapInstanceRef.current.flyTo([location.coordinates.lat, location.coordinates.lng], 10, {
        animate: true, duration: 1.5
      });
      
      // Abrir tooltip del marcador resaltado
      const marker = markersRef.current[highlightedLocationId];
      if (marker) {
        marker.openTooltip();
      }
    }
  }, [highlightedLocationId, locations]);

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
            <div className="relative aspect-video overflow-hidden group">
              <Image
                src={selected.image}
                alt={selected.name}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-red-500/80 border border-white/10 flex items-center justify-center text-white transition-all backdrop-blur-md rounded-full z-10"
              >
                <X size={14} />
              </button>

              <div className="absolute bottom-0 left-0 p-5 w-full">
                <div className="flex items-center justify-between items-end">
                  <div>
                    <div className="text-[9px] font-black text-primary tracking-[0.4em] uppercase mb-1">{selected.region}</div>
                    <h3 className="text-2xl font-black text-white tracking-tighter leading-none italic drop-shadow-lg">{selected.name}</h3>
                  </div>
                  {selected.distance && (
                    <div className="text-[9px] font-black text-white/50 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-sm border border-white/5 whitespace-nowrap">
                      A {selected.distance.toFixed(1)} KM
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <p className="text-slate-400 text-xs leading-relaxed font-medium mb-5">
                {selected.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/[0.03] p-3 rounded-sm border border-white/5 group/info hover:bg-white/[0.07] transition-colors">
                  <div className="text-[8px] font-black text-slate-500 tracking-widest uppercase mb-1 flex items-center gap-1 group-hover/info:text-primary transition-colors"><Mountain size={9} /> Altitud</div>
                  <div className="text-sm font-black text-white">{selected.metadata.altitude}</div>
                </div>
                <div className="bg-white/[0.03] p-3 rounded-sm border border-white/5 group/info hover:bg-white/[0.07] transition-colors">
                  <div className="text-[8px] font-black text-slate-500 tracking-widest uppercase mb-1 flex items-center gap-1 group-hover/info:text-primary transition-colors"><Clock size={9} /> Duración</div>
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

      {/* Leyenda reubicada a la derecha para evitar colisión */}
      <div className="absolute bottom-8 right-16 sm:right-20 z-[1000] animate-in fade-in duration-500">
        <div className="bg-black/60 border border-white/10 backdrop-blur-xl px-4 py-2 sm:py-3 flex items-center gap-4 rounded-sm shadow-2xl">
          <div className="relative">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary animate-pulse blur-[1px]" />
            <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/40 animate-ping" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white tracking-widest uppercase">{locations.length} Destinos</span>
            <span className="text-[7px] font-bold text-slate-500 tracking-widest uppercase">Explorando ahora</span>
          </div>
        </div>
      </div>
    </div>
  );
}
