'use client';

import { UserProfile } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ProfilePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white pt-48 pb-32 flex flex-col items-center px-6">
      <Navbar />
      <div className="max-w-4xl w-full">
        <header className="mb-20">
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.6em] mb-4 block">{t("profile.archive")}</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-slate-900 italic">
            {t("profile.title")} <span className="bronze-gradient not-italic">{t("profile.identity")}</span>
          </h1>
          <div className="w-20 h-1 bg-slate-900"></div>
        </header>

        <div className="p-12 border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
          
          <UserProfile 
            path="/perfil"
            appearance={{
              elements: {
                card: "bg-transparent shadow-none border-none",
                navbar: "hidden",
                headerTitle: "text-slate-900 font-black tracking-tighter text-2xl uppercase italic",
                headerSubtitle: "text-slate-400 font-bold text-[10px] uppercase tracking-widest",
                formButtonPrimary: "bg-slate-900 text-white rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all",
                footer: "hidden"
              }
            }}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
