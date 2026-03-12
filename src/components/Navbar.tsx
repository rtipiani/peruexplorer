'use client';

import Link from 'next/link';
import { 
  SignInButton, 
  SignUpButton, 
  UserButton,
  useAuth
} from "@clerk/nextjs";

import { useLanguage } from '@/i18n/LanguageContext';
import { Locale } from '@/i18n/translations';
import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const locales: { code: Locale; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <div className={`glass flex items-center justify-between w-full max-w-6xl px-6 lg:px-8 py-3 rounded-full transition-all duration-300 ${isMenuOpen ? 'rounded-b-none' : ''}`}>
        <div className="flex items-center gap-10">
          <Link href="/" className="text-xl font-black tracking-tight text-white">
            PERU<span className="text-primary">EXPLORER</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            {!isSignedIn ? (
              <>
                <Link href="/comunidad" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">{t('nav.community')}</Link>
                <Link href="/destinos" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">{t('nav.destinations')}</Link>
                <Link href="/planificar" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">{t('nav.plan')}</Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">{t('nav_auth.feed')}</Link>
                <Link href="/destinos" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">{t('nav_auth.archive')}</Link>
                <Link href="/planificar" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">{t('nav_auth.expeditions')}</Link>
                <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-all">{t('nav_auth.map')}</Link>
              </>
            )}
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Language Switcher */}
          {/* Professional Language Select (Desktop) */}
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:border-primary/30 transition-all focus-within:border-primary/50 group/lang">
            <Globe size={14} className="text-primary/70 group-hover/lang:text-primary transition-colors" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none text-white pl-2 pr-6"
            >
              {locales.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                   {l.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-[8px] text-slate-500">▼</div>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block"></div>

          <div className="flex items-center gap-6">
            {!isSignedIn ? (
              <div className="flex items-center gap-6">
                <SignInButton mode="modal">
                  <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">{t('nav.login')}</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-8 py-2.5 rounded-sm bg-primary text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-primary/10">
                    {t('nav.register')}
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/perfil" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">{t('nav.profile')}</Link>
                <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-all flex items-center gap-1.5 underline decoration-primary/20 underline-offset-4">
                  {t('nav.admin')}
                </Link>
                <div className="scale-90 border-l border-white/10 pl-6">
                  <UserButton />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-px bg-black/90 backdrop-blur-2xl rounded-b-3xl p-8 border-t border-white/10 animate-in slide-in-from-top-2 duration-300 shadow-2xl">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {!isSignedIn ? (
                  <>
                    <Link href="/comunidad" onClick={() => setIsMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white py-2">{t('nav.community')}</Link>
                    <Link href="/destinos" onClick={() => setIsMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white py-2">{t('nav.destinations')}</Link>
                    <Link href="/planificar" onClick={() => setIsMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white py-2">{t('nav.plan')}</Link>
                  </>
                ) : (
                  <>
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white py-2">{t('nav_auth.feed')}</Link>
                    <Link href="/destinos" onClick={() => setIsMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white py-2">{t('nav_auth.archive')}</Link>
                    <Link href="/planificar" onClick={() => setIsMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white py-2">{t('nav_auth.expeditions')}</Link>
                    <Link href="/mapa" onClick={() => setIsMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:text-white py-2">{t('nav_auth.map')}</Link>
                  </>
                )}
              </div>

              <div className="h-px bg-white/5 w-full"></div>

              <div className="flex flex-col gap-6 mt-4">
                {/* Professional Language Select (Mobile) */}
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 hover:border-primary/30 transition-all focus-within:border-primary/50">
                  <Globe size={15} className="text-primary/70" />
                  <select
                    value={locale}
                    onChange={(e) => { setLocale(e.target.value as Locale); setIsMenuOpen(false); }}
                    className="flex-1 bg-transparent text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none text-white pl-3 pr-6"
                  >
                    {locales.map((l) => (
                      <option key={l.code} value={l.code} className="bg-slate-900 text-white py-4">
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 pointer-events-none text-[8px] text-slate-500">▼</div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  {!isSignedIn ? (
                    <SignInButton mode="modal">
                      <button className="flex-1 py-4 rounded-2xl bg-primary text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-primary/20">
                        {t('nav.login')}
                      </button>
                    </SignInButton>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                       <Link 
                         href="/perfil" 
                         onClick={() => setIsMenuOpen(false)} 
                         className="text-[11px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-3"
                       >
                         <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                         {t('nav.profile')}
                       </Link>
                       <div className="bg-white/5 p-1 rounded-full border border-white/10">
                         <UserButton />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
