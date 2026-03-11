'use client';

import { useLanguage } from '@/i18n/LanguageContext';

export default function TravelCalendar() {
  const { t, locale } = useLanguage();
  
  const monthLabels: Record<string, string[]> = {
    es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  };

  const currentMonths = monthLabels[locale] || monthLabels['en'];

  return (
    <section id="planificar" className="section-padding bg-black relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">{t('calendar.analytics')}</span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">{t('calendar.title')} <span className="bronze-gradient italic">{t('calendar.explore')}</span></h2>
          <div className="w-20 h-1 bg-primary"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Calendar Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-white/5 p-px border border-white/5">
              {currentMonths.map((month, i) => (
                <div key={month} className={`p-8 transition-all bg-black relative group overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-full h-1 transition-transform duration-500 scale-x-0 group-hover:scale-x-100 ${[4, 5, 6, 7, 8].includes(i) ? 'bg-primary' : 'bg-white/10'}`}></div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-3">{month}</span>
                  <span className={`text-xl font-black tracking-tight ${[4, 5, 6, 7, 8].includes(i) ? 'text-primary' : 'text-slate-800'}`}>
                    {[4, 5, 6, 7, 8].includes(i) ? t('calendar.peak') : t('calendar.base')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monetization Card */}
          <div className="lg:col-span-4 p-12 border border-white/5 bg-white/5 flex flex-col justify-center relative overflow-hidden group rounded-sm">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform text-white">
              <span className="text-[10rem] font-black">SOL</span>
            </div>
            <h4 className="text-3xl font-black mb-6 text-white leading-tight tracking-tighter">{t('calendar.partnerships')}</h4>
            <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">{t('calendar.partnershipsDesc')}</p>
            <button className="w-full py-5 rounded-sm bg-primary text-slate-900 font-bold text-[10px] uppercase tracking-widest hover:bg-white transition-all">
              {t('calendar.apply')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
