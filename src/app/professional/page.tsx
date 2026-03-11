'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import MemberLayout from '@/components/MemberLayout';
import { 
  createBusinessProfile, 
  getBusinessProfile, 
  addBalance, 
  createAdCampaign, 
  getCampaigns,
  getBusinessPosts,
  createPaymentRequest,
  getMyPaymentRequests
} from '@/lib/actions/business-actions';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Plus,
  ArrowRight,
  User,
  Compass,
  Briefcase,
  ShieldCheck,
  Megaphone,
  Wallet,
  History,
  Sparkles,
  RefreshCw,
  ChevronRight,
  X
} from 'lucide-react';

export default function ProfessionalPanel() {
  return (
    <Suspense fallback={
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="animate-spin text-primary" size={32} />
        </div>
      </MemberLayout>
    }>
      <ProfessionalPanelContent />
    </Suspense>
  );
}

function ProfessionalPanelContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'GUIDE',
    accountType: 'PERSON', // PERSON, COMPANY
    taxId: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    logoUrl: '',
    verificationDocUrl: '',
  });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showWallet, setShowWallet] = useState(false);
  const [investment, setInvestment] = useState(100); 
  const [isRecharging, setIsRecharging] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [campaignTarget, setCampaignTarget] = useState<'PROFILE' | 'POST'>('PROFILE');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [businessPosts, setBusinessPosts] = useState<any[]>([]);
  const [paymentStep, setPaymentStep] = useState<'SELECT' | 'CONFIRM' | 'INSTRUCTIONS'>('SELECT');
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'YAPE' | 'BANK'>('YAPE');
  const [paymentReceipt, setPaymentReceipt] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  useEffect(() => {
    console.log('ProfessionalPanel: useEffect triggering with user:', user?.id);
    if (user && !isInitialCheckDone) {
      const fetchInitialData = async () => {
        try {
          console.log('Frtching initial business profile for:', user.id);
          const p = await getBusinessProfile(user.id);
          setProfile(p);
          if (p) {
            console.log('Profile found, fetching campaigns and posts');
            const [c, posts, payments] = await Promise.all([
              getCampaigns(user.id),
              getBusinessPosts(user.id),
              (getMyPaymentRequests as any)(user.id)
            ]);
            setCampaigns(c);
            setBusinessPosts(posts);
            setPaymentHistory(payments);
          }
        } catch (err) {
          console.error('Error in initial fetch:', err);
        } finally {
          setIsInitialCheckDone(true);
          setLoading(false);
          console.log('Initial check complete');
        }
      };
      fetchInitialData();
    }
  }, [user, isInitialCheckDone]);

  // Manejar promoción desde URL
  useEffect(() => {
    const promotePostId = searchParams.get('promotePostId');
    if (promotePostId && profile) {
      setCampaignTarget('POST');
      setSelectedPostId(promotePostId);
      setShowWallet(true);
      // Scroll to promotion section
      const promoSection = document.getElementById('promotion-section');
      if (promoSection) {
        promoSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams, profile]);

  // Detección automática de RUC
  useEffect(() => {
    if (formData.taxId.length >= 2) {
      if (formData.taxId.startsWith('20') && formData.accountType !== 'COMPANY') {
        console.log('Detectado RUC de empresa (20...), cambiando tipo a COMPANY');
        setFormData(prev => ({ ...prev, accountType: 'COMPANY' }));
      } else if (formData.taxId.startsWith('10') && formData.accountType !== 'PERSON') {
        console.log('Detectado RUC de persona (10...), cambiando tipo a PERSON');
        setFormData(prev => ({ ...prev, accountType: 'PERSON' }));
      }
    }
  }, [formData.taxId]);

  const handleAddBalance = async (amount: number) => {
    setSelectedTopUpAmount(amount);
    setPaymentStep('CONFIRM');
  };

  const handleSubmitPayment = async () => {
    if (!user || !paymentReceipt || selectedTopUpAmount <= 0) return;
    try {
      setIsRecharging(true);
      const grossAmount = parseFloat((selectedTopUpAmount * 1.18).toFixed(2));
      const res = await (createPaymentRequest as any)(user.id, grossAmount, paymentReceipt, paymentMethod);
      if (res.success) {
        alert("Comprobante enviado con éxito. El administrador validará tu pago pronto.");
        setPaymentStep('SELECT');
        setPaymentReceipt(null);
        setSelectedTopUpAmount(0);
      }
    } finally {
      setIsRecharging(false);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen del comprobante debe ser menor a 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCampaign = async (name: string, budget: number) => {
    if (!user) return;
    const res = await createAdCampaign(user.id, { 
      name, 
      budget,
      targetType: campaignTarget,
      targetId: campaignTarget === 'POST' ? selectedPostId || undefined : undefined
    });
    if (res.success) {
      const updatedCampaigns = await getCampaigns(user.id);
      setCampaigns(updatedCampaigns);
      alert(res.message || "Solicitud enviada para aprobación del administrador.");
    } else {
      alert(res.error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("El archivo es muy pesado. Intenta con uno menor a 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("El archivo es muy pesado. Intenta con uno menor a 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, verificationDocUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      console.log('Submitting professional registration format data');
      
      const payload = {
        userId: user.id,
        ...formData,
        website: formData.website || undefined,
        taxId: formData.taxId || undefined,
        logoUrl: formData.logoUrl || undefined,
        verificationDocUrl: formData.verificationDocUrl || undefined,
      };

      const result = await createBusinessProfile(payload);

      console.log('Server result:', result);

      if (result.success) {
        setProfile(result.profile);
        alert("¡Registro profesional completado con éxito!");
      } else {
        alert(`Error al registrar: ${result.error}`);
      }
    } catch (err) {
      console.error('Critical error in handleSubmit:', err);
      alert("Ocurrió un error inesperado al enviar el formulario. Revisa el tamaño de los archivos.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || (loading && !profile && !isInitialCheckDone)) {
    return (
      <MemberLayout activeItem="professional">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-10 bg-white/5 rounded-sm w-1/3 mx-auto" />
          <div className="h-4 bg-white/5 rounded-sm w-1/2 mx-auto" />
          <div className="h-[500px] bg-white/5 rounded-sm border border-white/5" />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout activeItem="professional">
      <div className="max-w-4xl mx-auto">
        {!profile ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Registro */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tighter">
                PANEL <span className="text-primary italic">PROFESIONAL</span>
              </h1>
              <p className="text-slate-400 max-w-xl mx-auto">
                Registra tu negocio o servicios de guía para aparecer ante miles de exploradores en todo el Perú.
              </p>
            </div>

            {/* Formulario de Registro */}
            <div className="bg-slate-900/20 border border-white/10 rounded-sm p-10 backdrop-blur-md relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <Briefcase size={200} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                {/* Selector de Tipo de Cuenta */}
                <div className="flex justify-center gap-4 p-1 bg-black border border-white/5 rounded-sm max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, accountType: 'PERSON'})}
                    className={`flex-1 py-2 px-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${formData.accountType === 'PERSON' ? 'bg-primary text-slate-900' : 'text-slate-500 hover:text-white'}`}
                  >
                    Persona Natural
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, accountType: 'COMPANY'})}
                    className={`flex-1 py-2 px-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${formData.accountType === 'COMPANY' ? 'bg-primary text-slate-900' : 'text-slate-500 hover:text-white'}`}
                  >
                    Empresa / Agencia
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Nombre del Negocio */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={12} /> {formData.accountType === 'PERSON' ? 'Nombre Completo' : 'Nombre Comercial'}
                    </label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-black border border-white/10 rounded-sm py-3 px-4 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                      placeholder={formData.accountType === 'PERSON' ? 'Tu nombre profesional' : 'Ej. Peru Expeditions S.A.C'}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  {/* RUC / DNI */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={12} /> {formData.accountType === 'PERSON' ? 'DNI / RUC' : 'Número de RUC'}
                    </label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-black border border-white/10 rounded-sm py-3 px-4 text-sm text-white focus:border-primary/50 outline-none transition-all"
                      placeholder={formData.accountType === 'PERSON' ? '8 u 11 dígitos' : '11 dígitos'}
                      value={formData.taxId}
                      onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                    />
                  </div>

                  {/* Tipo de Negocio */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase size={12} /> Tipo de Servicio
                    </label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-sm py-3 px-4 text-sm text-white focus:border-primary/50 outline-none transition-all"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="GUIDE">Guía Certificado</option>
                      <option value="AGENCY">Agencia de Viajes</option>
                      <option value="HOTEL">Hospedaje / Hotel</option>
                      <option value="RESTAURANT">Restaurante / Bar</option>
                      <option value="OTHER">Otro Servicio</option>
                    </select>
                  </div>

                  {/* Email de Contacto */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={12} /> Email de Contacto
                    </label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-black border border-white/10 rounded-sm py-3 px-4 text-sm text-white focus:border-primary/50 outline-none transition-all"
                      placeholder="hola@tuempresa.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Phone size={12} /> Teléfono / WhatsApp
                    </label>
                    <input 
                      required
                      type="tel"
                      className="w-full bg-black border border-white/10 rounded-sm py-3 px-4 text-sm text-white focus:border-primary/50 outline-none transition-all"
                      placeholder="+51 999 999 999"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    />
                  </div>
                </div>

                {/* Sitio Web y Logo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Globe size={12} /> Sitio Web (Opcional)
                    </label>
                    <input 
                      type="url"
                      className="w-full bg-black border border-white/10 rounded-sm py-3 px-4 text-sm text-white focus:border-primary/50 outline-none transition-all"
                      placeholder="https://www.tuempresa.com"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={12} /> Logo de la {formData.accountType === 'PERSON' ? 'Persona' : 'Empresa'}
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-white/10 bg-black flex items-center justify-center overflow-hidden shrink-0">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <Plus size={16} className="text-slate-700" />
                        )}
                      </div>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-white/5 file:text-white hover:file:bg-white/10 file:cursor-pointer cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Ficha RUC / Documento de Verificación */}
                <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <FileText size={14} /> Adjuntar Ficha RUC o Documento de Identidad
                    </label>
                    {formData.verificationDocUrl && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase">
                        <CheckCircle2 size={12} /> Archivo Cargado
                      </div>
                    )}
                  </div>
                  <input 
                    required
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleDocUpload}
                    className="w-full text-[10px] text-slate-500 file:mr-6 file:py-3 file:px-6 file:rounded-sm file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary file:text-slate-900 hover:file:bg-yellow-500 file:transition-all file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-600 italic">
                    * El documento es obligatorio para verificar tu cuenta y permitirte publicar anuncios.
                  </p>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={12} /> Descripción de Servicios
                  </label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-black border border-white/10 rounded-sm py-3 px-4 text-sm text-white focus:border-primary/50 outline-none transition-all resize-none"
                    placeholder="Cuéntanos sobre tu experiencia y qué servicios ofreces..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-yellow-500 p-4 rounded-sm text-slate-900 font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
                >
                  Confirmar Registro <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Dashboard del Profesional */}
            {/* Dashboard del Profesional */}
            <div className="bg-slate-900/40 p-6 md:p-8 border border-white/5 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              {/* Optional background accent for the card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="flex items-center gap-6 md:gap-8 relative z-10 w-full md:w-auto">
                {profile.logoUrl && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/10 overflow-hidden bg-black flex items-center justify-center shadow-xl hover:border-primary/50 transition-colors shrink-0">
                    <img src={profile.logoUrl} alt={profile.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-[2px] text-[8px] font-bold text-slate-500 tracking-wide">
                      {profile.accountType === 'COMPANY' ? 'Empresa' : 'Persona'}
                    </div>
                  </div>
                  <h1 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug break-words line-clamp-2 md:line-clamp-none max-w-lg">
                    {profile.name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                  </h1>
                  <div className="text-[10px] font-medium text-slate-500 tracking-wide mt-1">
                    RUC/DNI: <span className="text-slate-400 font-bold">{profile.taxId || 'No registrado'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end md:justify-start border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-[10px] font-bold text-slate-400 tracking-wider">
                  {profile.type === 'GUIDE' ? 'Guía' : 
                   profile.type === 'AGENCY' ? 'Agencia' : 
                   profile.type === 'HOTEL' ? 'Hospedaje' : 
                   profile.type === 'RESTAURANT' ? 'Restaurante' : 'Otro'}
                </div>
                {profile.isVerified ? (
                  <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-sm text-[10px] font-bold text-green-500 tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={12} /> Verificado
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-sm text-[10px] font-bold text-yellow-500 tracking-wider flex items-center gap-2">
                    <Clock size={12} /> Pendiente
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Estadísticas / Control */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-slate-900/40 p-5 border border-white/5 rounded-sm group hover:border-primary/30 transition-all cursor-pointer relative" onClick={() => setShowWallet(!showWallet)}>
                  {/* Etiqueta de acción rápida */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0">
                    <div className="bg-primary text-slate-900 p-1.5 rounded-sm">
                      <Plus size={12} strokeWidth={3} />
                    </div>
                  </div>

                  <div className="text-[9px] font-medium text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                    <Wallet size={10} className="text-primary" /> Billetera comercial
                  </div>
                  <div className="text-lg font-semibold text-white tracking-tight mb-1">
                    S/ {profile.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[8px] font-medium text-primary tracking-wide opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    Gestionar fondos <ArrowRight size={8} />
                  </div>
               </div>
                <div className="bg-slate-900/40 p-5 border border-white/5 rounded-sm group hover:border-primary/30 transition-all cursor-pointer">
                   <div className="text-[10px] font-medium text-slate-500 tracking-wide mb-4">Visibilidad</div>
                   <div className="text-lg font-semibold text-white tracking-tight mb-1">{campaigns.length > 0 ? (campaigns.length * 1250).toLocaleString() : '0'}</div>
                   <div className="text-[9px] font-medium text-slate-500 tracking-tight">Alcance proyectado</div>
                </div>
                <div className="bg-slate-900/40 p-5 border border-white/5 rounded-sm group hover:border-primary/30 transition-all cursor-pointer">
                   <div className="text-[10px] font-medium text-slate-500 tracking-wide mb-4">Campañas</div>
                   <div className="text-lg font-semibold text-white tracking-tight mb-1">{campaigns.length}</div>
                   <div className="text-[9px] font-medium text-slate-500 tracking-tight">Activas ahora</div>
                </div>
                <div className="bg-slate-900/40 p-5 border border-white/5 rounded-sm group hover:border-primary/30 transition-all cursor-pointer" onClick={() => setShowWallet(!showWallet)}>
                   <div className="text-[10px] font-medium text-slate-500 tracking-wide mb-4">Presupuesto operativo</div>
                   <div className="text-lg font-semibold text-white tracking-tight mb-1">S/ {profile.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                   <div className="text-[9px] font-medium text-slate-500 tracking-tight">Saldo Disponible (Neto)</div>
                </div>
            </div>

            {/* Wallet Modal / Calculator Section */}
            {showWallet && (
                <div id="promotion-section" className="bg-slate-950 border border-white/10 rounded-sm p-6 animate-in slide-in-from-top-4 duration-500 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row gap-10 relative z-10">
                    <div className="flex-1 space-y-5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
                            <Plus size={12} />
                          </div>
                          <h3 className="text-[10px] font-semibold text-white tracking-wide uppercase">
                            {paymentStep === 'SELECT' ? '1. Selecciona Inversión' : 
                             paymentStep === 'CONFIRM' ? '2. Método de Pago' : 
                             '3. Reportar Depósito'}
                          </h3>
                        </div>
                        {paymentStep !== 'SELECT' && (
                          <button 
                            onClick={() => setPaymentStep(paymentStep === 'INSTRUCTIONS' ? 'CONFIRM' : 'SELECT')}
                            className="text-[8px] text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                          >
                            <ArrowRight size={8} className="rotate-180" /> Volver
                          </button>
                        )}
                      </div>

                      {paymentStep === 'SELECT' ? (
                        <div className="grid grid-cols-1 gap-3">
                          {[50, 100, 500].map(amount => (
                            <button 
                              key={amount}
                              disabled={isRecharging}
                              onClick={() => handleAddBalance(amount)}
                              className={`group relative py-4 px-6 bg-white/[0.03] border border-white/5 rounded-sm transition-all hover:bg-white/[0.08] hover:border-primary/30 flex items-center justify-between overflow-hidden ${isRecharging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="flex flex-col items-start text-left">
                                <span className="text-[8px] font-medium text-slate-500 group-hover:text-primary transition-colors tracking-wide uppercase">Inversión: S/ {amount}</span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-sm font-semibold text-white">S/ {(amount * 1.18).toFixed(2)}</span>
                                  <span className="text-[7px] text-slate-500">con IGV</span>
                                </div>
                              </div>
                              <div className="bg-white/5 p-1 rounded-sm group-hover:bg-primary group-hover:text-slate-900 transition-all">
                                {isRecharging ? <RefreshCw size={10} className="animate-spin" /> : <ChevronRight size={10} />}
                              </div>
                              {amount === 100 && (
                                <div className="absolute top-0 right-0">
                                  <div className="bg-primary text-slate-900 text-[6px] font-bold px-2 py-0.5 shadow-lg">Popular</div>
                                </div>
                              )}
                            </button>
                          ))}

                          <div className="relative group p-4 bg-white/[0.03] border border-white/5 rounded-sm transition-all hover:bg-white/[0.05]">
                            <span className="text-[8px] font-medium text-slate-500 tracking-wide block mb-2 uppercase">Monto Personalizado (Sin IGV)</span>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black/40 border border-white/10 rounded-sm">
                                <span className="text-xs text-slate-500 font-bold">S/</span>
                                <input 
                                  type="number" 
                                  placeholder="0.00"
                                  value={customAmount}
                                  onChange={(e) => setCustomAmount(e.target.value)}
                                  className="bg-transparent border-none text-xs text-white w-full focus:ring-0 placeholder:text-slate-700" 
                                />
                              </div>
                              {customAmount && parseFloat(customAmount) > 0 && (
                                <div className="text-right shrink-0">
                                  <div className="text-[7px] text-slate-500 uppercase">Total + IGV</div>
                                  <div className="text-[10px] font-bold text-primary">S/ {(parseFloat(customAmount) * 1.18).toFixed(2)}</div>
                                </div>
                              )}
                              <button 
                                disabled={isRecharging || !customAmount || parseFloat(customAmount) <= 0}
                                onClick={() => handleAddBalance(parseFloat(customAmount))}
                                className="bg-primary hover:bg-yellow-500 text-slate-900 p-2 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : paymentStep === 'CONFIRM' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                          <div className="bg-primary/5 border border-primary/20 p-5 rounded-sm">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Resumen de Cargo</span>
                              <div className="px-2 py-0.5 bg-primary text-slate-900 text-[8px] font-black rounded-full">FACTURA ELECTRÓNICA</div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-slate-300">
                                <span>Presupuesto Publicitario</span>
                                <span>S/ {selectedTopUpAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>IGV (18%)</span>
                                <span>S/ {(selectedTopUpAmount * 0.18).toFixed(2)}</span>
                              </div>
                              <div className="h-px bg-white/10 my-2" />
                              <div className="flex justify-between text-sm font-black text-white">
                                <span className="text-primary uppercase tracking-widest text-[10px]">Total a Depositar</span>
                                <span>S/ {(selectedTopUpAmount * 1.18).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Selecciona método de abono:</span>
                             <div className="grid grid-cols-2 gap-3">
                                <button 
                                  onClick={() => setPaymentMethod('YAPE')}
                                  className={`p-4 rounded-sm border transition-all flex flex-col items-center gap-2 ${paymentMethod === 'YAPE' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                >
                                  <Phone size={18} />
                                  <span className="text-[9px] font-bold uppercase">Yape / Plin</span>
                                </button>
                                <button 
                                  onClick={() => setPaymentMethod('BANK')}
                                  className={`p-4 rounded-sm border transition-all flex flex-col items-center gap-2 ${paymentMethod === 'BANK' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                >
                                  <Building2 size={18} />
                                  <span className="text-[9px] font-bold uppercase">Transferencia</span>
                                </button>
                             </div>
                          </div>

                          <button 
                            onClick={() => setPaymentStep('INSTRUCTIONS')}
                            className="w-full py-4 bg-primary hover:bg-yellow-500 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-xl shadow-primary/10"
                          >
                            Continuar a Instrucciones
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
                          <div className="bg-white/5 border border-white/10 p-5 rounded-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Realiza el pago de:</div>
                              <div className="text-sm font-black text-white">S/ {(selectedTopUpAmount * 1.18).toFixed(2)}</div>
                            </div>
                            
                            <div className="h-px bg-white/10" />

                            <div className="grid grid-cols-1 gap-3">
                              {paymentMethod === 'YAPE' ? (
                                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-sm">
                                  <div>
                                    <div className="text-[10px] font-black text-white uppercase mb-1">Yape / Plim</div>
                                    <div className="text-[11px] text-primary font-bold tracking-widest">987 654 321</div>
                                    <div className="text-[8px] text-slate-500 mt-1">Nombre: Peru Explorer E.I.R.L.</div>
                                  </div>
                                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                    <Phone size={18} />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/20 rounded-sm">
                                  <div>
                                    <div className="text-[10px] font-black text-white uppercase mb-1">BCP Soles (Transferencia)</div>
                                    <div className="text-[11px] text-blue-400 font-bold tracking-widest">193-98765432-0-12</div>
                                    <div className="text-[8px] text-slate-500 mt-1">CCI: 002-193009876543201211</div>
                                  </div>
                                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                    <Building2 size={18} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                        <div className="space-y-3">
                          <div className="text-[9px] text-slate-400 font-medium">Sube una foto de tu comprobante para validar tu saldo:</div>
                          
                          <label className={`block w-full border-2 border-dashed rounded-sm p-6 text-center transition-all cursor-pointer ${paymentReceipt ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/30 bg-white/[0.02]'}`}>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleReceiptUpload} 
                            />
                            {paymentReceipt ? (
                              <div className="space-y-2">
                                <CheckCircle2 className="mx-auto text-primary" size={20} />
                                <div className="text-[9px] text-white">Comprobante cargado correctamente</div>
                                <button 
                                  onClick={(e) => { e.preventDefault(); setPaymentReceipt(null); }}
                                  className="text-[8px] text-slate-500 underline"
                                >
                                  Cambiar imagen
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <FileText className="mx-auto text-slate-600" size={20} />
                                <div className="text-[9px] text-slate-500">Cargar imagen del comprobante</div>
                                <div className="text-[7px] text-slate-700">Formatos: JPG, PNG (Max 2MB)</div>
                              </div>
                            )}
                          </label>

                          <button 
                            disabled={isRecharging || !paymentReceipt}
                            onClick={handleSubmitPayment}
                            className={`w-full py-3 rounded-sm text-slate-900 text-[9px] font-bold tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${!paymentReceipt ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10' : 'bg-primary hover:bg-yellow-500 shadow-primary/20'}`}
                          >
                            {isRecharging ? <RefreshCw size={12} className="animate-spin" /> : 'Confirmar envío de comprobante'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-6 md:border-l border-white/5 md:pl-12">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Sparkles size={12} />
                      </div>
                      <h3 className="text-[10px] font-semibold text-white tracking-wide">Proyección de alcance</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Selección de Objetivo */}
                      <div className="bg-black/40 p-4 rounded-sm border border-white/5 space-y-3">
                        <span className="text-[8px] font-medium text-slate-500 tracking-wide uppercase">Objetivo de la campaña</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setCampaignTarget('PROFILE')}
                            className={`flex-1 py-2 px-3 rounded-sm text-[9px] font-semibold transition-all border ${campaignTarget === 'PROFILE' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                          >
                            Mi perfil profesional
                          </button>
                          <button 
                            onClick={() => setCampaignTarget('POST')}
                            className={`flex-1 py-2 px-3 rounded-sm text-[9px] font-semibold transition-all border ${campaignTarget === 'POST' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                          >
                            Una publicación
                          </button>
                        </div>

                        {campaignTarget === 'POST' && (
                          <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                             <span className="text-[7px] font-bold text-slate-600 tracking-wider">SELECCIONA UNA PUBLICACIÓN</span>
                             <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                               {businessPosts.length > 0 ? businessPosts.map((post: any) => (
                                 <div 
                                   key={post.id}
                                   onClick={() => setSelectedPostId(post.id)}
                                   className={`p-2 rounded-sm border transition-all cursor-pointer flex gap-3 items-center ${selectedPostId === post.id ? 'bg-primary/5 border-primary/40' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                 >
                                   {post.imageUrl && (
                                     <div className="w-8 h-8 rounded-sm bg-cover bg-center shrink-0 border border-white/10" style={{backgroundImage: `url(${post.imageUrl})`}} />
                                   )}
                                   <div className="flex-1 min-w-0">
                                     <div className="text-[9px] text-white truncate font-medium">{post.content}</div>
                                     <div className="text-[7px] text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                                   </div>
                                 </div>
                               )) : (
                                 <div className="text-[8px] text-slate-700 italic py-2">No has realizado publicaciones aún.</div>
                               )}
                             </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-black/40 p-5 rounded-sm border border-white/5 space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] font-medium text-slate-500 tracking-wide">Inversión estimada</span>
                          <span className="text-[10px] font-semibold text-primary italic">S/ {investment}</span>
                        </div>
                        <input 
                          type="range" 
                          min="100" 
                          max="5000" 
                          step="100"
                          value={investment}
                          onChange={(e) => setInvestment(parseInt(e.target.value))}
                          className="w-full accent-primary bg-white/5 h-1 rounded-full appearance-none cursor-ew-resize"
                        />
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-sm">
                        <div className="flex-1 text-center">
                          <div className="text-sm font-medium text-white tracking-tighter">{(investment * 15).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                          <div className="text-[7px] text-slate-500 font-normal tracking-wide">Vistas Estimadas</div>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex-1 text-center">
                          <div className="text-[10px] font-medium text-white tracking-tighter">S/ {investment.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                          <div className="text-[7px] text-slate-500 font-normal tracking-wide">Consumo de Saldo</div>
                        </div>
                      </div>

                      <button 
                        disabled={profile.balance < investment || (campaignTarget === 'POST' && !selectedPostId)}
                        onClick={() => handleCreateCampaign(`Campaña - ${campaignTarget === 'PROFILE' ? 'Perfil' : 'Post seleccionado'}`, investment)}
                        className={`w-full py-3 rounded-sm text-slate-900 text-[9px] font-semibold tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${profile.balance < investment || (campaignTarget === 'POST' && !selectedPostId) ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10' : 'bg-primary hover:bg-yellow-500 cursor-pointer shadow-primary/20'}`}
                      >
                        {(campaignTarget === 'POST' && !selectedPostId) ? 'Selecciona una publicación' : (profile.balance < investment ? 'Saldo insuficiente' : 'Lanzar campaña ahora')}
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Campañas */}
            <div className="bg-slate-900/40 p-6 md:p-8 border border-white/5 rounded-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                  <History size={16} />
                </div>
                <h3 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">Historial de Inversión</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {campaigns.length > 0 ? campaigns.map((campaign : any) => (
                  <div 
                    key={campaign.id} 
                    onClick={() => setSelectedCampaign(campaign)}
                    className="flex items-center justify-between p-4 bg-slate-900/20 border border-white/5 rounded-sm group hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Megaphone size={14} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white">{campaign.name}</div>
                        <div className="text-[9px] text-slate-600 font-semibold tracking-widest">{new Date(campaign.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">S/ {campaign.budget}</div>
                      <div className="text-[8px] font-bold text-green-500 tracking-widest">{
                        campaign.status === 'ACTIVE' ? 'Activa' : 
                        campaign.status === 'PENDING' ? 'Pendiente' : 
                        campaign.status === 'COMPLETED' ? 'Completada' : 'Cancelada'
                      }</div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 border border-dashed border-white/5 rounded-sm text-center text-[9px] text-slate-600 font-bold tracking-widest">
                    No hay campañas activas. Tu inversión aparecerá aquí.
                  </div>
                )}
              </div>
            </div>

            {/* Historial de Recargas */}
            <div className="bg-slate-900/40 p-6 md:p-8 border border-white/5 rounded-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                  <Wallet size={16} />
                </div>
                <h3 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">Historial de Recargas</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {paymentHistory.length > 0 ? (
                  paymentHistory.map((pay: any) => {
                    const gross = pay.amount;
                    const net = gross / 1.18;
                    const igv = gross - net;
                    
                    return (
                      <div key={pay.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/20 border border-white/5 rounded-sm gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pay.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : pay.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            {pay.status === 'APPROVED' ? <CheckCircle2 size={14} /> : pay.status === 'REJECTED' ? <History size={14} /> : <Clock size={14} />}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-white uppercase tracking-tight">Depósito Real: S/ {gross.toLocaleString()}</div>
                            <div className="text-[8px] text-slate-500 font-medium">Validado el {new Date(pay.updatedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                          <div className="text-left md:text-right">
                            <div className="text-[7px] text-slate-500 uppercase font-black">IGV (18%)</div>
                            <div className="text-[10px] font-bold text-slate-400">S/ {igv.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                          </div>
                          <div className="text-left md:text-right">
                            <div className="text-[7px] text-primary uppercase font-black">Neto Acreditado</div>
                            <div className="text-[10px] font-black text-white">S/ {net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                          </div>
                        </div>

                        <div className={`text-[9px] font-bold rounded-full px-3 py-1 text-center md:min-w-[80px] ${
                          pay.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' : 
                          pay.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' : 
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {pay.status === 'APPROVED' ? 'Aprobado' : pay.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 border border-dashed border-white/5 rounded-sm text-center text-[9px] text-slate-600 font-bold tracking-widest uppercase">
                    No hay historial de recargas.
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje de Info */}
            <div className="bg-slate-900/40 p-6 md:p-8 border border-white/5 rounded-sm">
               <div className="flex items-start gap-5">
                  <div className="text-blue-500 mt-1"><Compass size={28} /></div>
                  <div>
                    <div className="text-xs font-bold text-blue-500 tracking-widest mb-2">Métricas de Monetización</div>
                    <p className="text-xs text-slate-400 leading-relaxed">Tus anuncios se mostrarán en el feed principal y en el mapa interactivo de Peru Explorer, priorizando las regiones que ofrecen tus servicios.</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Modal Detalle de Campaña */}
        {selectedCampaign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-950 border border-white/10 w-full max-w-md rounded-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <div className="absolute top-0 right-0 p-4 z-20">
                <button 
                  onClick={() => setSelectedCampaign(null)}
                  className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-full transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Cabecera con efecto de luz - Altura flexible */}
              <div className="relative min-h-[140px] bg-gradient-to-br from-primary/20 to-transparent flex items-end p-6 pb-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 pr-8">
                  <div className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-2 opacity-80">Detalle de Inversión</div>
                  <h2 className="text-base font-semibold text-white tracking-tight leading-snug">{selectedCampaign.name}</h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-4 rounded-sm border border-white/5 shadow-inner">
                    <div className="text-[8px] font-medium text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Presupuesto Neto</div>
                    <div className="text-lg font-semibold text-white">S/ {selectedCampaign.budget.toFixed(2)}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-sm border border-white/5 shadow-inner">
                    <div className="text-[8px] font-medium text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Estado Actual</div>
                    <div className={`text-[10px] font-semibold uppercase tracking-tight ${
                      selectedCampaign.status === 'ACTIVE' ? 'text-green-500' : 
                      selectedCampaign.status === 'PENDING' ? 'text-yellow-500' : 
                      selectedCampaign.status === 'COMPLETED' ? 'text-blue-500' : 'text-slate-500'
                    }`}>
                      {selectedCampaign.status === 'ACTIVE' ? '• Activa' : 
                       selectedCampaign.status === 'PENDING' ? '• En Revisión' : 
                       selectedCampaign.status === 'COMPLETED' ? '• Completada' : '• Cancelada'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center border border-white/10">
                      <Clock size={14} />
                    </div>
                    <div>
                      <div className="text-[8px] font-medium uppercase tracking-wider text-slate-600">Fecha de Creación</div>
                      <div className="text-[11px] font-normal text-white/90">{new Date(selectedCampaign.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center border border-white/10">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <div className="text-[8px] font-medium uppercase tracking-wider text-slate-600">Alcance Proyectado</div>
                      <div className="text-[11px] font-normal text-white/90">{(selectedCampaign.budget * 15).toLocaleString()} vistas estimadas</div>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-2" />

                  {/* Objetivo de Campaña */}
                  <div className="space-y-3">
                    <div className="text-[9px] font-medium text-slate-500 uppercase tracking-widest opacity-60">Objetivo de la Campaña:</div>
                    {selectedCampaign.targetType === 'POST' ? (
                      <div className="p-4 bg-black/40 border border-white/5 rounded-sm flex gap-4">
                        <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                          <Megaphone size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-semibold text-white uppercase mb-1">Promoción de Publicación</div>
                          <div className="text-[9px] text-slate-500 leading-relaxed font-normal opacity-80">Impulsando visibilidad en el feed y mapa.</div>
                          <div className="mt-2 text-[8px] text-primary/70 font-medium font-mono">ID: {selectedCampaign.targetId || 'N/A'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-black/40 border border-white/5 rounded-sm flex gap-4">
                        <div className="w-12 h-12 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                          <User size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-semibold text-white uppercase mb-1">Visibilidad de Perfil</div>
                          <div className="text-[9px] text-slate-500 leading-relaxed font-normal opacity-80">Promocionando tu perfil profesional en búsquedas.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setSelectedCampaign(null)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-semibold uppercase tracking-widest rounded-sm transition-all shadow-inner"
                  >
                    Cerrar Detalle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
