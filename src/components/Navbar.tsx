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
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  const locales: { code: Locale; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (mobileLangRef.current && !mobileLangRef.current.contains(event.target as Node)) {
        // Para móvil, el control de cierre es más sutil
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          {/* Custom Language Dropdown (Desktop) */}
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-300 group/lang ${
                isLangOpen 
                ? 'bg-white/10 border-primary/40 shadow-[0_0_20px_rgba(166,141,91,0.2)]' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <Globe size={14} className={`${isLangOpen ? 'text-primary' : 'text-slate-500'} transition-colors`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {locales.find(l => l.code === locale)?.label}
              </span>
              <ChevronDown size={10} className={`text-slate-500 transition-transform duration-300 ${isLangOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isLangOpen && (
              <div className="absolute top-full right-0 mt-3 w-48 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[100]">
                <div className="flex flex-col gap-1">
                  {locales.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLocale(l.code);
                        setIsLangOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        locale === l.code 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{l.label}</span>
                      <span className="text-sm">{l.flag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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

              <div className="flex flex-col gap-4 mt-2">
                {/* Custom Language Dropdown (Mobile) */}
                <div className="flex flex-wrap gap-2">
                  {locales.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLocale(l.code);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        locale === l.code 
                        ? 'bg-primary border-primary text-slate-900 shadow-lg shadow-primary/20' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <span className="text-xs">{l.flag}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  {!isSignedIn ? (
                    <SignInButton mode="modal">
                      <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        {t('nav.login')}
                      </button>
                    </SignInButton>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                       <Link 
                         href="/perfil" 
                         onClick={() => setIsMenuOpen(false)} 
                         className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"
                       >
                         <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                         {t('nav.profile')}
                       </Link>
                       <div className="bg-white/5 p-1.5 rounded-full border border-white/10">
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
