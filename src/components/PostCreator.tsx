'use client';

import { useState, useRef } from 'react';
import { useUser, SignInButton } from "@clerk/nextjs";
import { useLanguage } from '@/i18n/LanguageContext';
import { ImageIcon, MapPin, Send, Zap, Globe, Lock, X } from 'lucide-react';
import { createPost } from '@/lib/actions/post-actions';

export default function PostCreator() {
  const { user, isSignedIn } = useUser();
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state || data.address.country;
          setLocationName(city);
        } catch (error) {
          console.error("Error geocodificando ubicación:", error);
          setLocationName("Ubicación detectada");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        let message = "No se pudo obtener tu ubicación.";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "Permiso denegado. Por favor, habilita la ubicación en tu navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Información de ubicación no disponible.";
            break;
          case error.TIMEOUT:
            message = "Tiempo de espera agotado al obtener la ubicación.";
            break;
        }
        console.error(`Error GPS (${error.code}): ${error.message}`);
        alert(message);
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage) return;
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const result = await createPost({
        userId: user.id,
        userName: user.fullName || user.username || 'Explorer',
        userAvatar: user.imageUrl,
        content: content.trim(),
        location: locationName || "Perú",
        imageUrl: selectedImage || undefined,
      });

      if (result.success) {
        setContent('');
        setSelectedImage(null);
        setLocationName(null);
        // Trigger local refresh
        window.dispatchEvent(new Event('px_new_post'));
      }
    } catch (err) {
      console.error('Error saving post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="p-12 border border-slate-900 bg-slate-900 text-white relative overflow-hidden group mb-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Lock size={120} strokeWidth={1} className="rotate-12" />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-4 tracking-tight italic">{t('community.joinTitle')}</h3>
          <p className="text-sm text-slate-400 mb-10 font-medium max-w-sm italic leading-relaxed">{t('community.joinDesc')}</p>
          <SignInButton mode="modal">
            <button className="px-12 py-5 bg-primary text-slate-900 font-bold text-[10px] tracking-[0.3em] hover:bg-white transition-all shadow-xl shadow-primary/20">
              {t('community.enterNow')}
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className={`p-8 bg-black border rounded-sm transition-all duration-300 ${isFocused ? 'border-primary/40 bg-slate-900/10 shadow-xl shadow-primary/[0.02]' : 'border-white/10 bg-transparent'}`}>
        {/* Decorative backdrop - More subtle */}
        <div className={`absolute top-0 right-0 p-6 opacity-[0.015] pointer-events-none text-white transition-opacity duration-500 ${isFocused ? 'opacity-0' : 'opacity-100'}`}>
           <Globe size={180} strokeWidth={0.5} />
        </div>

        <div className="flex gap-6 mb-8 relative z-10">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-sm bg-slate-900 p-px relative ring-1 ring-white/5">
               <div className="absolute inset-0 bronze-gradient opacity-5" />
               <img 
                 src={user?.imageUrl} 
                 alt="User" 
                 className="w-full h-full object-cover grayscale opacity-70 group-hover:opacity-100 transition-opacity" 
               />
               <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-black flex items-center justify-center">
                 <Zap size={7} className="text-slate-900 fill-slate-900" />
               </div>
            </div>
          </div>
          
          <div className="flex-1">
            <textarea 
              placeholder={t('community.postPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-base font-medium text-white placeholder:text-white/20 resize-none tracking-tight leading-relaxed italic"
              rows={3}
            />

            {/* Image Preview */}
            {selectedImage && (
              <div className="mt-4 relative group/img max-w-sm rounded-sm overflow-hidden border border-white/10">
                <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-60 object-cover" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {selectedImage && (
              <p className="text-[9px] text-green-500 mt-2 font-mono uppercase tracking-widest">Debug: Image Data Loaded ({Math.round(selectedImage.length/1024)} KB)</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 relative z-10 gap-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="flex gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all flex items-center gap-3 group/tool"
            >
               <ImageIcon size={14} className="group-hover:text-primary transition-colors" />
               <span>{t('community.multimedia')}</span>
            </button>
            <div className="flex items-center gap-2 group/loc">
              <button 
                onClick={handleGetLocation}
                disabled={isDetectingLocation}
                className={`px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${isDetectingLocation ? 'animate-pulse text-primary' : 'text-slate-400 hover:text-white'}`}
              >
                {isDetectingLocation ? (
                  <div className="w-3 h-3 border border-primary/30 border-t-primary animate-spin rounded-full" />
                ) : (
                  <MapPin size={14} className={locationName ? 'text-primary' : 'group-hover/loc:text-primary transition-colors'} />
                )}
                <span>{isDetectingLocation ? 'Detectando...' : locationName || t('community.location')}</span>
              </button>
              
              {locationName && !isDetectingLocation && (
                <button 
                  onClick={() => setLocationName(null)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-600 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={(!content.trim() && !selectedImage) || isSubmitting}
            className={`w-full sm:w-auto px-10 py-3 rounded-sm font-black text-[9px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 relative overflow-hidden group/publish ${
              (content.trim() || selectedImage) && !isSubmitting 
              ? 'bg-primary text-slate-900 hover:bg-white hover:-translate-y-0.5 shadow-[0_10px_20px_-10px_rgba(205,170,125,0.3)] active:translate-y-0' 
              : 'bg-white/5 text-slate-700 cursor-not-allowed grayscale'
            }`}
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-primary animate-spin rounded-full" />
            ) : (
              <>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/publish:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                <span className="relative z-10">{t('community.publish')}</span>
                <Send size={12} className="relative z-10 group-hover/publish:translate-x-1 group-hover/publish:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Visual guide line */}
      <div className={`h-1 bronze-gradient transition-all duration-1000 origin-left ${isFocused ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  );
}
