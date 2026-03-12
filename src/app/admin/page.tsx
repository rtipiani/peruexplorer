'use client';

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { 
  Users, 
  CreditCard, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Building2,
  User,
  XCircle,
  FileText,
  MapPin
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/i18n/LanguageContext";
import { 
  getAdminDashboardData, 
  approveBusinessProfile, 
  rejectBusinessProfile,
  approvePaymentRequest,
  rejectPaymentRequest,
  approveAdCampaign,
  rejectAdCampaign
} from "@/app/actions/adminActions";
import { 
  getAdminLocations, 
  updateLocationImage 
} from "@/app/actions/locationActions";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user, isLoaded } = useUser();
  
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const [isProcessingCampaign, setIsProcessingCampaign] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminDashboardData();
      if (res.success) {
        setData(res.data);
      } else {
        setErrorMsg(res.error || "Error desconocido");
        toast.error("Error al cargar datos del panel");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Error de conexión");
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await getAdminLocations();
      if (res.success) {
        setLocations(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email !== "rtipiani@gmail.com") {
        setErrorMsg("Acceso Restringido: Únicamente el Superadministrador puede acceder a esta terminal.");
        setIsLoading(false);
        return;
      }
      fetchData();
      fetchLocations();
    }
  }, [isLoaded, user]);

  const handleRejectProfile = async (id: string) => {
    const reason = window.prompt("¿Seguro que deseas rechazar este nodo?\nEsto eliminará sus datos irremediablemente.\n\nPor favor, escribe el motivo del rechazo para notificar al usuario:");
    if (!reason || reason.trim() === "") {
        toast.info("Rechazo cancelado. Es obligatorio indicar un motivo.");
        return;
    }
    
    setIsRejecting(id);
    try {
      const res = await rejectBusinessProfile(id, reason);
      if (res.success) {
        toast.success("Nodo rechazado y usuario notificado.");
        fetchData();
      } else {
        toast.error(res.error || "No se pudo rechazar");
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsRejecting(null);
    }
  };

  const handleApproveProfile = async (id: string) => {
    setIsApproving(id);
    try {
      const res = await approveBusinessProfile(id);
      if (res.success) {
        toast.success("Perfil verificado correctamente");
        fetchData();
      } else {
        toast.error(res.error || "No se pudo aprobar");
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsApproving(null);
    }
  };

  const handleApprovePayment = async (id: string) => {
    setIsProcessingPayment(id);
    try {
      const res = await approvePaymentRequest(id);
      if (res.success) {
        toast.success("Pago verificado y saldo actualizado.");
        fetchData();
      } else {
        toast.error(res.error || "No se pudo aprobar el pago");
      }
    } catch (error) {
      toast.error("Error al procesar el pago");
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const handleRejectPayment = async (id: string) => {
    const reason = window.prompt("Motivo del rechazo del pago:");
    if (!reason) return;

    setIsProcessingPayment(id);
    try {
      const res = await rejectPaymentRequest(id, reason);
      if (res.success) {
        toast.success("Pago rechazado.");
        fetchData();
      } else {
        toast.error(res.error || "No se pudo rechazar");
      }
    } catch (error) {
      toast.error("Error al procesar");
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const handleApproveCampaign = async (id: string) => {
    setIsProcessingCampaign(id);
    try {
      const res = await approveAdCampaign(id);
      if (res.success) {
        toast.success("Campaña aprobada y saldo descontado.");
        fetchData();
      } else {
        toast.error(res.error || "No se pudo aprobar la campaña");
      }
    } catch (error) {
      toast.error("Error al procesar la campaña");
    } finally {
      setIsProcessingCampaign(null);
    }
  };

  const handleRejectCampaign = async (id: string) => {
    const reason = window.prompt("Motivo del rechazo de la campaña:");
    if (!reason) return;

    setIsProcessingCampaign(id);
    try {
      const res = await rejectAdCampaign(id, reason);
      if (res.success) {
        toast.success("Campaña rechazada.");
        fetchData();
      } else {
        toast.error(res.error || "No se pudo rechazar");
      }
    } catch (error) {
      toast.error("Error al procesar");
    } finally {
      setIsProcessingCampaign(null);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Redimensionar si es muy grande (max 1200px)
          const MAX_WIDTH = 1200;
          if (width > MAX_WIDTH) {
            height = (MAX_WIDTH / width) * height;
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Comprimir a JPEG con calidad 0.7
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleUpdateImage = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdatingLocation(id);
    const loadingToast = toast.loading("Procesando y optimizando imagen...");
    
    try {
      const compressedBase64 = await compressImage(file);
      const res = await updateLocationImage(id, compressedBase64);
      
      if (res.success) {
        toast.success("Foto del destino actualizada correctamente", { id: loadingToast });
        fetchLocations();
      } else {
        toast.error(res.error || "No se pudo actualizar la foto", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error crítico al procesar el archivo local", { id: loadingToast });
    } finally {
      setIsUpdatingLocation(null);
      // Limpiar el input para permitir subir la misma foto si se desea
      e.target.value = '';
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin" size={32} />
          <div className="text-[10px] uppercase tracking-widest font-bold">Cargando Terminal Central...</div>
        </div>
      </div>
    );
  }

  // Si no hay datos, probablemente no es admin o hubo un error severo
  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <ShieldCheck size={48} className="text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Acceso Denegado</h1>
          <p className="text-slate-400 text-sm">{errorMsg || "No tienes permisos para visualizar el Centro de Comando."}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-sm transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0f16] text-slate-300 pt-32 pb-40 px-6 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <span className="text-primary text-[10px] font-medium tracking-[0.4em] mb-2 block uppercase">Admin Terminal</span>
            <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Centro de Mando</h1>
            <p className="text-slate-500 mt-2 max-w-xl text-sm font-light">Monitoreo de afiliaciones profesionales, métricas de inversión publicitaria y seguridad general de la plataforma de Peru Explorer.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors text-white" title="Actualizar datos">
              <RefreshCw size={18} />
            </button>
            <div className="p-1 bg-white/5 border border-white/10 rounded-full">
              <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
            </div>
          </div>
        </header>

        {/* Top Report Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Financial KPI Card */}
          <div className="lg:col-span-3 bg-slate-900/40 border border-white/5 p-8 rounded-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-colors" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-medium text-[9px] tracking-[0.2em] uppercase mb-1">
                  <ShieldCheck size={12} /> Caja Real (Ingreso Total)
                </div>
                <div className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                  S/ {(data.metrics.totalIncome || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <p className="text-[10px] text-slate-500 max-w-sm">
                  Monto total físicamente recolectado por Yape o Banco (Dato Real).
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 w-full md:w-auto pt-8 md:pt-0 border-t md:border-t-0 border-white/5">
                <div className="space-y-1 pr-4 border-r border-white/5">
                  <div className="text-[9px] uppercase tracking-widest text-green-500/70 font-bold">Ganancia Total</div>
                  <div className="text-base font-medium text-white">S/ {(data.metrics.totalProfit || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <div className="text-[9px] text-slate-500 leading-tight">Incluye IGV (Dato real)</div>
                </div>
                <div className="space-y-1 pr-4 border-r border-white/5">
                  <div className="text-[9px] uppercase tracking-widest text-slate-500/70 font-bold">IGV Acumulado</div>
                  <div className="text-base font-medium text-white">S/ {(data.metrics.totalIGVAccumulated || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <div className="text-[9px] text-slate-500 leading-tight">Impuesto al 18%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] uppercase tracking-widest text-blue-500/70 font-bold">Saldo Circulante</div>
                  <div className="text-base font-medium text-white">S/ {(data.metrics.totalWalletBalance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <div className="text-[9px] text-slate-500 leading-tight">Dinero en billeteras</div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Community Status */}
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Users size={16} />
                <span className="text-[9px] font-medium tracking-widest uppercase">Población Profesional</span>
              </div>
              <div className="space-y-1">
                 <div className="text-xl font-medium text-white">{data.metrics.verifiedProfiles}</div>
                 <div className="text-[9px] text-slate-500">Nodos verificados y operativos</div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest">
                <span>Total Registros</span>
                <span className="text-white">{data.metrics.totalProfiles}</span>
              </div>
              <div className="w-full bg-white/5 h-1 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-1000" 
                  style={{ width: `${(data.metrics.verifiedProfiles / (data.metrics.totalProfiles || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Aprobaciones (Más ancha) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-semibold text-white flex items-center gap-3">
              <ShieldCheck className="text-primary" /> Validación de Nodos Profesionales
            </h2>
            
            <div className="space-y-4">
              {data.pendingProfiles && data.pendingProfiles.length > 0 ? (
                data.pendingProfiles.map((p: any) => (
                  <div key={p.id} className="bg-slate-900/60 border border-white/10 p-6 rounded-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-full bg-black border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {p.logoUrl ? (
                          <img src={p.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : p.accountType === 'COMPANY' ? <Building2 size={24} className="text-slate-600"/> : <User size={24} className="text-slate-600"/>}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-bold rounded-sm tracking-widest uppercase">Nuevo Ingreso</span>
                           <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                             RUC/DNI: <span className="text-slate-300">{p.taxId}</span>
                           </span>
                        </div>
                        <h3 className="text-sm font-bold text-white capitalize">{p.name}</h3>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span>{p.accountType === 'COMPANY' ? 'Empresa' : 'Persona'}</span>
                          &bull;
                          <span>
                            {p.type === 'GUIDE' ? 'Guía' : p.type === 'AGENCY' ? 'Agencia' : p.type === 'HOTEL' ? 'Hospedaje' : p.type === 'RESTAURANT' ? 'Restaurante' : 'Otro'}
                          </span>
                          &bull;
                          <a href={`mailto:${p.contactEmail}`} className="text-blue-400 hover:underline">{p.contactEmail}</a>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
                      {p.verificationDocUrl && (
                        <button 
                          onClick={() => {
                            if (p.verificationDocUrl.startsWith('data:')) {
                              // Es base64
                              const win = window.open();
                              if (win) {
                                win.document.write(`<iframe src="${p.verificationDocUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                              }
                            } else {
                              // Es URL normal
                              window.open(p.verificationDocUrl, '_blank');
                            }
                          }}
                          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-medium rounded-sm text-center transition-colors"
                        >
                          Revisar Ficha RUC
                        </button>
                      )}
                      <div className="flex gap-2 w-auto mt-2 text-right justify-end">
                        <button 
                          onClick={() => handleRejectProfile(p.id)}
                          disabled={isRejecting === p.id || isApproving === p.id}
                          className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[11px] font-medium rounded-sm text-center transition-colors flex items-center gap-1.5 justify-center whitespace-nowrap"
                        >
                          {isRejecting === p.id ? (
                             <RefreshCw size={12} className="animate-spin" />
                          ) : (
                             <><XCircle size={12} /> Rechazar</>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => handleApproveProfile(p.id)}
                          disabled={isApproving === p.id || isRejecting === p.id}
                          className="px-4 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 text-[11px] font-medium rounded-sm text-center transition-colors flex items-center gap-1.5 justify-center whitespace-nowrap"
                        >
                          {isApproving === p.id ? (
                             <><RefreshCw size={12} className="animate-spin" /> Verificando...</>
                          ) : (
                             <><CheckCircle2 size={12} /> Aprobar Nodo</>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="bg-slate-900/20 border border-dashed border-white/10 p-12 rounded-sm text-center">
                  <CheckCircle2 size={40} className="text-green-500/50 mx-auto mb-4" />
                  <h3 className="text-white font-bold tracking-tight mb-2">Todo Limpio</h3>
                  <p className="text-slate-500 text-sm">No hay perfiles profesionales pendientes de verificación en este momento.</p>
                </div>
              )}
            </div>

            {/* Nueva Sección de Pagos */}
            <div className="space-y-6 pt-12 border-t border-white/5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-3">
                <CreditCard className="text-primary" /> Validación de Pagos (Yape/Banco)
              </h2>
              
              <div className="space-y-4">
                {data.pendingPayments && data.pendingPayments.length > 0 ? (
                  data.pendingPayments.map((pay: any) => (
                    <div key={pay.id} className="bg-slate-900/60 border border-white/10 p-6 rounded-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium text-slate-500 tracking-widest leading-none">RECARGA DE SALDO</span>
                            <span className="text-green-400 font-semibold text-sm">S/ {pay.amount}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-white">{pay.business?.name || 'Empresa'}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-500">Solicitado el {new Date(pay.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${pay.method === 'BANK' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                              {pay.method || 'YAPE'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full md:w-auto">
                         <button 
                          onClick={() => {
                            if (!pay.receiptUrl) return toast.error("No hay comprobante disponible");
                            if (pay.receiptUrl.startsWith('data:')) {
                              const win = window.open();
                              if (win) {
                                win.document.write(`<iframe src="${pay.receiptUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                              }
                            } else {
                              window.open(pay.receiptUrl, '_blank');
                            }
                          }}
                          className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold rounded-sm transition-colors flex items-center gap-2 justify-center"
                        >
                          Ver Comprobante
                        </button>
                        
                        <button 
                          onClick={() => handleRejectPayment(pay.id)}
                          disabled={isProcessingPayment === pay.id}
                          className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] font-bold rounded-sm transition-colors"
                        >
                          Rechazar
                        </button>

                        <button 
                          onClick={() => handleApprovePayment(pay.id)}
                          disabled={isProcessingPayment === pay.id}
                          className="flex-1 md:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-black text-[10px] font-semibold rounded-sm transition-colors flex items-center gap-2 justify-center"
                        >
                          {isProcessingPayment === pay.id ? <RefreshCw size={14} className="animate-spin" /> : 'Aprobar Pago'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-900/20 border border-dashed border-white/10 p-8 rounded-sm text-center">
                    <p className="text-slate-500 text-xs italic">No hay pagos pendientes de validación.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nueva Sección de Solicitudes de Campaña */}
            <div className="space-y-6 pt-12 border-t border-white/5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-3">
                <ShieldCheck className="text-primary" /> Solicitudes de Promoción (Pendientes)
              </h2>
              
              <div className="space-y-4">
                {data.pendingCampaigns && data.pendingCampaigns.length > 0 ? (
                  data.pendingCampaigns.map((camp: any) => (
                    <div key={camp.id} className="bg-slate-900/60 border border-white/10 p-6 rounded-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                      <div className="flex items-start gap-5 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
                           {camp.targetType === 'POST' ? <FileText size={24} /> : <Building2 size={24} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium text-slate-500 tracking-widest leading-none uppercase">INVERSIÓN PUBLICITARIA</span>
                            <span className="text-primary font-bold text-sm">S/ {camp.budget}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-white truncate">{camp.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                             <div className="text-[10px] text-slate-400">Cliente: <span className="font-bold">{camp.businessName}</span></div>
                             <div className="text-[10px] text-slate-400">Saldo: <span className={`font-bold ${camp.businessBalance < camp.budget ? 'text-red-500' : 'text-green-500'}`}>S/ {camp.businessBalance}</span></div>
                             <div className="text-[10px] text-slate-500 italic">ID: {camp.targetId || 'Perfil'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full md:w-auto shrink-0">
                        <button 
                          onClick={() => handleRejectCampaign(camp.id)}
                          disabled={isProcessingCampaign === camp.id}
                          className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] font-bold rounded-sm transition-colors"
                        >
                          Rechazar
                        </button>

                        <button 
                          onClick={() => handleApproveCampaign(camp.id)}
                          disabled={isProcessingCampaign === camp.id}
                          className="flex-1 md:flex-none px-4 py-2 bg-primary hover:bg-yellow-500 text-black text-[10px] font-semibold rounded-sm transition-colors flex items-center gap-2 justify-center"
                        >
                          {isProcessingCampaign === camp.id ? <RefreshCw size={14} className="animate-spin" /> : 'Aprobar Campaña'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-900/20 border border-dashed border-white/10 p-8 rounded-sm text-center">
                    <p className="text-slate-500 text-xs italic">No hay solicitudes de promoción pendientes.</p>
                  </div>
                )}
              </div>
            </div>


            {/* Historial de Pagos Aprobados */}
            <div className="space-y-6 pt-12 border-t border-white/5">
              <h2 className="text-sm font-semibold text-slate-400 flex items-center gap-3">
                <Clock className="text-slate-500" size={18} /> Historial de Recargas (Últimas 10)
              </h2>
              
              <div className="space-y-3">
                {data.approvedPayments && data.approvedPayments.length > 0 ? (
                  data.approvedPayments.map((pay: any) => (
                    <div key={pay.id} className="bg-white/5 border border-white/5 p-4 rounded-sm flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-4">
                        <div className="text-green-500/50">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <span className="text-xs font-semibold text-white">{pay.business?.name}</span>
                             <span className="text-[10px] text-slate-500">S/ {pay.amount}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-tighter">Validado el {new Date(pay.updatedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button 
                         onClick={() => {
                            if (pay.receiptUrl.startsWith('data:')) {
                              const win = window.open();
                              if (win) win.document.write(`<iframe src="${pay.receiptUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                            } else {
                              window.open(pay.receiptUrl, '_blank');
                            }
                         }}
                         className="text-[9px] text-primary hover:underline font-medium"
                      >
                        Ver Comprobante
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-slate-600 italic">Aún no se han registrado recargas validadas.</div>
                )}
              </div>
            </div>

            {/* Gestión de Destinos Turísticos */}
            <div className="space-y-6 pt-12 border-t border-white/5">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-white flex items-center gap-3">
                  <MapPin className="text-primary" /> Gestión de Destinos Turísticos
                </h2>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">{locations.length} Destinos Activos</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locations.slice(0, 10).map((loc: any) => (
                  <div key={loc.id} className="bg-slate-900/40 border border-white/5 p-4 rounded-sm flex gap-4 group hover:border-white/10 transition-all">
                    <div className="w-20 h-20 bg-black rounded-sm overflow-hidden shrink-0 relative">
                       <img src={loc.image} alt={loc.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                       <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                         <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleUpdateImage(e, loc.id)}
                            disabled={isUpdatingLocation === loc.id}
                         />
                         {isUpdatingLocation === loc.id ? <RefreshCw size={14} className="animate-spin text-white" /> : <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Subir Foto</span>}
                       </label>
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">{loc.region}</span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-[9px] text-slate-500 uppercase">{loc.id.slice(0, 8)}...</span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{loc.name}</h4>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500">
                         <span>{loc.altitude}</span>
                         <span className={`font-bold ${
                           loc.difficulty === 'Challenging' || loc.difficulty === 'Extreme' ? 'text-orange-500' : 'text-green-500'
                         }`}>{loc.difficulty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {locations.length > 10 && (
                <div className="text-center pt-4">
                   <p className="text-[9px] text-slate-600 italic">Mostrando 10 de {locations.length} destinos. La gestión completa está habilitada.</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Historico Actividad Finance */}
          <div className="space-y-6">
             <h2 className="text-sm font-semibold text-white flex items-center gap-3">
              <CreditCard className="text-slate-500" /> Monitoreo de Publicidad
            </h2>
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-sm">
               <h3 className="text-[10px] uppercase tracking-widest font-medium text-slate-500 mb-6">Últimas Campañas Registradas</h3>
               <div className="space-y-4">
                 {data.recentCampaigns && data.recentCampaigns.length > 0 ? (
                   data.recentCampaigns.map((camp: any) => (
                     <div key={camp.id} className="border-l-2 border-primary/50 pl-4 py-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[11px] font-bold text-white">{camp.business.name}</span>
                          <span className="text-[11px] font-bold text-green-400">S/ {camp.budget}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 flex justify-between">
                          <span>{new Date(camp.createdAt).toLocaleDateString()}</span>
                          <span className="bg-white/5 px-2 rounded-full">{
                            camp.status === 'ACTIVE' ? 'Activa' : 
                            camp.status === 'PENDING' ? 'Pendiente' : 
                            camp.status === 'COMPLETED' ? 'Terminada' : 'Cancelada'
                          }</span>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-xs text-slate-500 italic text-center py-8">Vacio.</div>
                 )}
               </div>
               <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold tracking-widest rounded-sm transition-colors border border-white/5 flex items-center justify-center gap-2">
                 Reporte Completo <ArrowRight size={14} />
               </button>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
