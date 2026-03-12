'use client';

import { useLanguage } from '@/i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-black py-32 px-10 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
        <span className="text-[20rem] font-black tracking-tighter select-none">PERÚ</span>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-16 relative z-10">
        <div className="space-y-12">
          <div className="text-3xl font-black tracking-tighter italic uppercase">
            Peru<span className="text-primary not-italic">Explorer</span>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{t('footer.edition')}</span>
            <span className="text-sm font-bold">{t('footer.collection')}</span>
          </div>
        </div>

        <div className="md:text-right space-y-8">
          <div className="flex flex-col md:items-end gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('footer.identity')}</a>
          </div>
          <div className="text-slate-500 text-[10px] font-medium leading-relaxed max-w-xs md:ml-auto">
            {t('footer.disclaimer')}
          </div>
        </div>
      </div>
      
      {/* Copyright and Version removed at user request */}
    </footer>
  );
}
