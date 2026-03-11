'use client';

import { useState, useEffect } from 'react';
import { useAuth, SignInButton } from "@clerk/nextjs";

interface ReactionProps {
  initialCount: number;
  icon: string;
  activeColor: string;
}

import { useLanguage } from '@/i18n/LanguageContext';

function Reaction({ initialCount, icon, activeColor }: ReactionProps) {
  const { isSignedIn } = useAuth();
  const { t } = useLanguage();
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (active) {
      setCount(prev => prev - 1);
    } else {
      setCount(prev => prev + 1);
    }
    setActive(!active);
  };

  return (
    <div className="relative inline-block group/react">
      <button 
        onClick={handleClick}
        className={`px-6 py-2 rounded-sm border transition-all duration-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 ${active ? activeColor : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
      >
        <span className="text-sm grayscale group-hover/react:grayscale-0 transition-all">{icon}</span>
        <span className="tabular-nums" suppressHydrationWarning>{count.toLocaleString()}</span>
      </button>

      {showLoginPrompt && (
        <div className="absolute bottom-full left-0 mb-6 w-56 p-6 bg-slate-900 text-white rounded-sm border border-white/10 shadow-2xl z-20 animate-float">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/70">{t('community.restricted')}</p>
          <p className="text-xs font-medium mb-6 leading-relaxed">{t('community.restrictedDesc')}</p>
          <SignInButton mode="modal">
            <button className="w-full py-3 rounded-sm bg-primary text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">{t('community.signIn')}</button>
          </SignInButton>
        </div>
      )}
    </div>
  );
}

export default function ReactionButtons({ reactions }: { reactions: any }) {
  return (
    <div className="flex flex-wrap gap-4">
      <Reaction initialCount={reactions.love} icon="❤️" activeColor="bg-slate-900 border-slate-900 text-white" />
      <Reaction initialCount={reactions.plane} icon="✈️" activeColor="bg-slate-900 border-slate-900 text-white" />
      <Reaction initialCount={reactions.map} icon="📍" activeColor="bg-slate-900 border-slate-900 text-white" />
    </div>
  );
}
