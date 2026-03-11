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

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { t, locale, setLocale } = useLanguage();

  const locales: { code: Locale; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <div className="glass flex items-center justify-between w-full max-w-6xl px-8 py-3 rounded-full">
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

        <div className="flex items-center gap-8">
          {/* Language Switcher */}
          <div className="relative group/lang">
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/lang:text-white transition-colors">
              <span className="text-sm">{locales.find(l => l.code === locale)?.flag}</span>
              <span>{locale}</span>
            </button>
            <div className="absolute top-full right-0 mt-4 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-300 translate-y-2 group-hover/lang:translate-y-0">
              <div className="bg-slate-900 border border-white/5 shadow-2xl rounded-sm p-2 flex flex-col min-w-[140px]">
                {locales.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={`flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 ${locale === l.code ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
                  >
                    <span>{l.label}</span>
                    <span>{l.flag}</span>
                  </button>
                ))}
              </div>
            </div>
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
      </div>
    </nav>
  );
}
