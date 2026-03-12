'use client';

import Image from 'next/image';

import { useLanguage } from '@/i18n/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <header className="relative min-h-[700px] lg:h-screen lg:min-h-[900px] flex items-center justify-center overflow-hidden bg-black">
      {/* Background with ultra-subtle overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-peru.jpg"
          alt="Machu Picchu"
          fill
          className="object-cover opacity-[0.3] grayscale-[0.2]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-6xl pt-32 lg:pt-20">
        <div className="animate-float mb-6 lg:mb-8">
          <span className="px-4 lg:px-6 py-1.5 rounded-sm border border-white/10 text-slate-400 text-[9px] lg:text-[10px] font-bold tracking-[0.3em] lg:tracking-[0.4em] uppercase bg-white/5 backdrop-blur-sm">
            {t('hero.spirit')}
          </span>
        </div>
        
        <h1 className="text-5xl md:text-[8rem] font-black mb-6 lg:mb-8 tracking-[-0.05em] text-white leading-[0.85]">
          {t('hero.title')}<br/>
          <span className="bronze-gradient">{t('hero.subtitle')}</span>
        </h1>
        
        <p className="text-sm md:text-lg text-slate-400 mb-10 lg:mb-14 max-w-xl mx-auto font-medium leading-relaxed tracking-tight">
          {t('hero.description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 lg:gap-5 justify-center items-center">
          <button className="w-full sm:w-auto px-10 lg:px-12 py-4 lg:py-5 rounded-sm bg-primary text-slate-900 font-bold text-[10px] lg:text-xs uppercase tracking-widest hover:bg-white transition-all shadow-2xl shadow-primary/10">
            {t('hero.discover')}
          </button>
          <button className="w-full sm:w-auto px-10 lg:px-12 py-4 lg:py-5 rounded-sm glass text-white font-bold text-[10px] lg:text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
            {t('hero.join')}
          </button>
        </div>
      </div>

      {/* Modern Vertical Indicator */}
      <div className="absolute bottom-12 right-12 z-10 hidden xl:flex flex-col items-center gap-8">
        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] [writing-mode:vertical-lr] mb-2">{t('hero.scroll')}</div>
        <div className="w-px h-24 bg-primary/30"></div>
      </div>
    </header>
  );
}
