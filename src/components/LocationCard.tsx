'use client';

import Image from 'next/image';
import Link from 'next/link';
import ReactionButtons from './ReactionButtons';
import { Location } from '@/data/tourismData';

import { useLanguage } from '@/i18n/LanguageContext';

export default function LocationCard({ location }: { location: any }) {
  const { t } = useLanguage();

  return (
    <div className="group bg-black border border-white/5 flex flex-col transition-all duration-700 hover:border-primary/50">
      {/* Framed image - Smaller padding and more compact aspect */}
      <div className="p-3 bg-black">
        <div className="aspect-[3/2] relative overflow-hidden bg-slate-900 border border-white/5">
          <Image 
            src={location.image} 
            alt={location.name}
            fill
            className="object-cover transition-all duration-1000 scale-100 group-hover:scale-105 grayscale-[0.5] group-hover:grayscale-0"
          />
        </div>
      </div>
      
      {/* Technical Info Block - More compact */}
      <div className="p-6 pb-8 flex flex-col flex-1 border-t border-white/5">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            {location.tags?.slice(0, 2).map((tag: string) => (
              <span key={tag} className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-primary transition-colors">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">
            R.{location.id.toString().substring(0, 3).toUpperCase()}
          </span>
        </div>
        
        <h3 className="text-2xl font-black mb-3 text-white tracking-tighter leading-none italic uppercase">
          {location.name}
        </h3>
        
        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
          <span className="w-6 h-px bg-white/10"></span> {location.altitude}
        </p>
        
        <div className="mt-auto pt-5 border-t border-white/5 flex justify-between items-center overflow-hidden">
          <Link 
            href={`/destinos/${location.id}`}
            className="text-white font-black text-[9px] uppercase tracking-[0.4em] flex items-center gap-2 translate-y-0 group-hover:translate-x-1 transition-transform duration-500 hover:text-primary"
          >
            {t('destinations.details')} <span className="text-primary text-lg">→</span>
          </Link>
          <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <span className="text-[7px] font-black text-slate-500">P.E</span>
          </div>
        </div>
      </div>
    </div>
  );
}
