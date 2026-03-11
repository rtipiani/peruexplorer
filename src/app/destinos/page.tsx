'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegionExplorer from "@/components/RegionExplorer";
import MemberLayout from "@/components/MemberLayout";
import { useAuth } from "@clerk/nextjs";
import { useLanguage } from '@/i18n/LanguageContext';

export default function DestinationsPage() {
  const { t } = useLanguage();
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isSignedIn) {
    return (
      <MemberLayout activeItem="destinos">
        <RegionExplorer />
      </MemberLayout>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      
      {/* Exploration Header */}
      <section className="pt-48 pb-24 px-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="max-w-4xl text-center mx-auto">
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">
            {t('destinations.selection')}
          </span>
          <h1 className="text-7xl md:text-8xl font-black mb-12 tracking-[-0.05em] text-white leading-none italic">
             Explora el <br/> <span className="bronze-gradient not-italic">Archivo Nacional</span>
          </h1>
          <p className="text-slate-500 text-xl font-medium leading-relaxed tracking-tight max-w-2xl mx-auto">
            Acceso completo a nuestra red de destinos verificados en todas las regiones del territorio peruano.
          </p>
        </div>
      </section>

      {/* Region Explorer Integration */}
      <section className="px-6 py-32 max-w-[1600px] mx-auto">
        <RegionExplorer />
      </section>

      <Footer />
    </main>
  );
}
