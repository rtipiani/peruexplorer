'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TravelCalendar from "@/components/TravelCalendar";
import { useLanguage } from '@/i18n/LanguageContext';
import { useEffect, useState } from 'react';
import { ShieldCheck, Compass, Calendar } from 'lucide-react';

import MemberLayout from "@/components/MemberLayout";
import { useAuth } from "@clerk/nextjs";

export default function PlanningPage() {
  const { t } = useLanguage();
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isSignedIn) {
    return (
      <MemberLayout>
        <section className="bg-slate-900 p-12 lg:p-16 border border-white/5 shadow-2xl mb-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
               <Compass size={300} strokeWidth={1} />
            </div>
            <div className="max-w-4xl relative z-10">
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">
                {t('calendar.analytics')}
              </span>
              <h1 className="text-4xl lg:text-5xl font-black mb-10 tracking-[-0.05em] text-white leading-[0.85] italic uppercase">
                {t('calendar.title')} <br/>
                <span className="bronze-gradient not-italic">{t('calendar.explore')}</span>
              </h1>
              <div className="w-24 h-2 bg-primary mb-10"></div>
              <p className="text-slate-400 text-base font-medium leading-relaxed tracking-tight max-w-xl">
                {t('calendar.partnershipsDesc')}
              </p>
            </div>
        </section>

        <div className="bg-white border border-slate-100 p-px mb-20 shadow-xl shadow-slate-900/5">
           <TravelCalendar />
        </div>

        <section className="py-20 px-10 bg-slate-50 border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-primary">
                  <Compass size={24} />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Logística de Expedición</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Diseñamos rutas balanceadas que respetan el ritmo de los Andes y la esencia del paisaje local.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Seguridad Verificada</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Cada nodo de nuestra red de transporte y alojamiento ha sido auditado bajo protocolos de alta gama.
                </p>
              </div>

              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-primary">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Optimización Estacional</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Algoritmos predictivos para capturar la "hora de oro" en cada monumento sin las multitudes habituales.
                </p>
              </div>
            </div>
        </section>
      </MemberLayout>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">
            {t('calendar.analytics')}
          </span>
          <h1 className="text-7xl md:text-9xl font-black mb-10 tracking-[-0.05em] text-slate-900 leading-[0.85] italic uppercase">
            {t('calendar.title')} <br/>
            <span className="bronze-gradient not-italic">{t('calendar.explore')}</span>
          </h1>
          <div className="w-24 h-2 bg-slate-900 mb-10"></div>
          <p className="text-slate-400 text-xl font-medium leading-relaxed tracking-tight max-w-xl">
            {t('calendar.partnershipsDesc')}
          </p>
        </div>
      </section>

      {/* Main Content - Calendar Integration */}
      <div className="border-t border-slate-50 mt-10">
        <TravelCalendar />
      </div>

      {/* Premium Planning Insights Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto border-t border-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-primary">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Logística de Expedición</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Diseñamos rutas balanceadas que respetan el ritmo de los Andes y la esencia del paisaje local.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-primary">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Seguridad Verificada</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Cada nodo de nuestra red de transporte y alojamiento ha sido auditado bajo protocolos de alta gama.
            </p>
          </div>

          <div className="space-y-6">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-primary">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Optimización Estacional</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Algoritmos predictivos para capturar la "hora de oro" en cada monumento sin las multitudes habituales.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
