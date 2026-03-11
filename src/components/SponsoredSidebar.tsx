'use client';

import { useEffect, useState } from 'react';
import { getSponsoredProfiles } from '@/lib/actions/business-actions';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function SponsoredSidebar() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getSponsoredProfiles();
        setProfiles(data);
      } catch (error) {
        console.error('Error loading sponsored profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-sm h-48" />
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-white/5 p-8 rounded-sm text-center">
        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-4 block">Sponsorship Content</span>
        <p className="text-[10px] text-slate-500 font-medium italic">Espacio disponible para socios estratégicos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {profiles.map((profile) => (
        <div key={profile.id} className="relative group overflow-hidden bg-slate-900/40 border border-white/5 p-5 rounded-sm transition-all hover:bg-slate-900/60">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Sponsorship Content</span>
              {profile.isVerified && <ShieldCheck size={10} className="text-primary" />}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-sm overflow-hidden bg-black border border-white/10 relative">
                {profile.logoUrl ? (
                  <Image src={profile.logoUrl} alt={profile.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-700">BIZ</div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white italic tracking-tight leading-none mb-1">{profile.name}</h4>
                <p className="text-[8px] text-primary/70 font-medium uppercase tracking-tighter">{profile.type}</p>
              </div>
            </div>

            <p className="text-[9px] leading-relaxed text-slate-500 font-normal mb-4 line-clamp-2 italic">
              "{profile.description}"
            </p>

            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-[8px] font-semibold uppercase tracking-widest transition-all border border-white/5"
              >
                Visitar Sitio <ExternalLink size={9} />
              </a>
            )}
          </div>

          {/* Background decoration */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
        </div>
      ))}
    </div>
  );
}
