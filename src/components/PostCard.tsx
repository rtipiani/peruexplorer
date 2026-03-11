'use client';

import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { useUser } from '@clerk/nextjs';
import { MapPin, Clock, X, ChevronLeft, ChevronRight, ZoomIn, Pencil, Trash2, ImageIcon, Check, AlertTriangle, Megaphone } from 'lucide-react';
import { PiHeart, PiHeartFill, PiChatCircle, PiPaperPlaneTilt, PiDotsThreeBold, PiMapPin, PiCaretUp } from 'react-icons/pi';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePost, deletePost, addComment, getComments, toggleLike, toggleCommentLike, editComment, deleteComment } from '@/lib/actions/post-actions';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  likedByUser: boolean;
  parentId?: string | null;
}

interface PostCardProps {
  postId: string;
  postUserId: string;
  user: {
    name: string;
    avatar: string;
    location: string;
  };
  content: string;
  image?: string;
  images?: string[];
  timestamp: string;
  isEdited?: boolean;
  reactions: {
    loves: number;
    comments: number;
  };
  latestComment?: {
    user: string;
    text: string;
  };
  isPromoted?: boolean;
  initiallyLiked?: boolean;
}

export default function PostCard({ postId, postUserId, user, content, image, images, timestamp, isEdited, reactions, latestComment, isPromoted, initiallyLiked }: PostCardProps) {
  const { t } = useLanguage();
  const { user: currentUser } = useUser();
  const router = useRouter(); // Hook para navegación
  const [isLiked, setIsLiked] = useState(initiallyLiked ?? false);
  const [localLoves, setLocalLoves] = useState(reactions.loves);
  const [shared, setShared] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Estados de Comentarios
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null);

  // Estados de edición de comentarios
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [activeCommentMenuOpen, setActiveCommentMenuOpen] = useState<string | null>(null);

  // Cargar comentarios
  useEffect(() => {
    if (showComments) {
      const loadComments = async () => {
        setIsLoadingComments(true);
        const data = await getComments(postId, currentUser?.id);
        setComments(data);
        setIsLoadingComments(false);
      };
      loadComments();
    }
  }, [showComments, postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const result = await addComment({
      postId,
      userId: currentUser.id,
      userName: currentUser.fullName || currentUser.username || 'Explorador',
      userAvatar: currentUser.imageUrl,
      content: commentText.trim(),
      parentId: replyingTo?.id || undefined,
    });

    if (result.success) {
      setCommentText('');
      setReplyingTo(null);
      // Recargar comentarios
      const data = await getComments(postId, currentUser?.id);
      setComments(data);
    }
    setIsSubmittingComment(false);
  };

  const handleSaveCommentEdit = async (commentId: string) => {
    if (!currentUser || !editCommentText.trim() || isSavingEdit) return;
    setIsSavingEdit(true);
    
    // Optimistic update
    setComments(current => current.map(c => 
      c.id === commentId ? { ...c, content: editCommentText.trim() } : c
    ));
    
    setEditingCommentId(null);
    setActiveCommentMenuOpen(null);

    const result = await editComment(commentId, currentUser.id, editCommentText.trim());
    if (!result.success) {
      // Revert if failed (reload from server)
      const data = await getComments(postId, currentUser.id);
      setComments(data);
    }
    setIsSavingEdit(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;
    
    // Optimistic delete
    setComments(current => current.filter(c => c.id !== commentId && c.parentId !== commentId));

    const result = await deleteComment(commentId, currentUser.id, postId);
    if (!result.success) {
      // Revert if failed

      const data = await getComments(postId, currentUser.id);
      setComments(data);
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!currentUser) return;

    // Optimistically update
    setComments(currentComments => 
      currentComments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            likedByUser: !c.likedByUser,
            likes: c.likedByUser ? c.likes - 1 : c.likes + 1
          };
        }
        return c;
      })
    );

    const result = await toggleCommentLike(commentId, currentUser.id);
    if (!result.success) {
      // Revert if failed
      setComments(currentComments => 
        currentComments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              likedByUser: !result.liked,
              likes: !result.liked ? c.likes - 1 : c.likes + 1
            };
          }
          return c;
        })
      );
    }
  };

  // Dropdown menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [editImage, setEditImage] = useState<string | null | undefined>(image);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Displayed content (optimistic update)
  const [displayContent, setDisplayContent] = useState(content);
  const [displayImage, setDisplayImage] = useState<string | undefined>(image);
  const [hidden, setHidden] = useState(false);
  const [edited, setEdited] = useState(isEdited ?? false);

  const [isExpanded, setIsExpanded] = useState(false);

  const allImages: string[] = displayImage ? [displayImage] : images?.length ? images : [];
  const isOwner = currentUser?.id === postUserId && postUserId !== '';

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(i => (i! > 0 ? i! - 1 : allImages.length - 1));
  const nextImage = () => setLightboxIndex(i => (i! < allImages.length - 1 ? i! + 1 : 0));

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const result = await updatePost(postId, currentUser.id, {
        content: editContent.trim(),
        imageUrl: editImage === undefined ? null : editImage,
      });
      if (result.success) {
        setDisplayContent(editContent.trim());
        setDisplayImage(editImage ?? undefined);
        setEdited(true);
        setIsEditing(false);
        window.dispatchEvent(new Event('px_post_updated'));
      }
    } catch (err) {
      console.error('Error updating post:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    setIsDeleting(true);
    try {
      const result = await deletePost(postId, currentUser.id);
      if (result.success) {
        setHidden(true);
        window.dispatchEvent(new Event('px_post_updated'));
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (hidden) return null;

  return (
    <>
      <div className="bg-[#0B0F19]/90 backdrop-blur-md border border-white/[0.08] rounded-xl mb-6 shadow-2xl transition-all duration-500 overflow-hidden w-full max-w-[600px] mx-auto">
        
        {/* Sutil resplandor en la parte superior para un estilo premium */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* --- 1. HEADER (Instagram Style) --- */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900/50 flex-shrink-0 relative ring-2 ring-[#0B0F19] outline outline-1 outline-white/10">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-[10px] rounded-full">PX</div>
              )}
            </div>
            <div className="flex flex-col justify-center grow">
              <div className="flex items-center gap-x-2 flex-wrap leading-tight">
                {/* 1. Nombre de usuario (Prio 1: Blanco/Resaltado) */}
                <span className="font-bold text-white text-[13px] tracking-tight flex items-center gap-2">
                  {user.name}
                  {isPromoted && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded-sm text-[8px] font-black text-primary uppercase tracking-widest animate-pulse">
                      <Megaphone size={8} /> Promocionado
                    </span>
                  )}
                </span>
                
                {/* 2. Conector "está en" (Prio 3: Subtle Slate) */}
                <span className="text-[11px] text-slate-500 font-medium">
                  está en
                </span>

                {/* 3. Lugar de ubicación (Prio 2: Color destacado/Slate suave) */}
                <button 
                  onClick={() => router.push(`/?location=${encodeURIComponent(user.location)}`)}
                  className="flex items-center gap-1 text-[12px] text-slate-300 font-semibold hover:text-primary transition-colors group/loc"
                >
                  <PiMapPin size={13} className="text-primary flex-shrink-0 group-hover/loc:scale-110 transition-transform" />
                  <span className="hover:underline decoration-primary/30 underline-offset-4">{user.location}</span>
                </button>

                {/* 4. Estado Editado (Opcional) */}
                {edited && (
                  <span className="text-[10px] text-slate-600 italic">
                    • {t('community.edited')}
                  </span>
                )}
              </div>
              {/* Nueva línea: Fecha y Hora */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium tracking-wide mt-1">
                <Clock size={11} className="text-slate-600" />
                <span>{timestamp}</span>
              </div>
            </div>
          </div>

          {/* Menú de Opciones */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors rounded-full"
            >
              <PiDotsThreeBold size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-50 w-40 bg-[#0F172A] border border-white/10 shadow-xl rounded-lg overflow-hidden">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); setIsEditing(true); setEditContent(displayContent); setEditImage(displayImage); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-[11px] font-medium text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <Pencil size={14} className="text-primary/80" />
                      {t('community.edit')}
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-[11px] font-medium text-red-400 hover:bg-red-400/10 transition-colors border-t border-white/5"
                    >
                      <Trash2 size={14} />
                      {t('community.delete')}
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-3 text-[11px] text-slate-500 font-medium text-center">
                    Sin acciones disponibles
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- 2. ÁREA DE IMAGEN (Full Width Instagram Style) --- */}
        {allImages.length > 0 && (
          <div className="w-full relative bg-black border-y border-white/5 group/gallery">
            {/* Imagen Principal */}
            <button 
              onClick={() => openLightbox(0)}
              className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center overflow-hidden"
            >
              <Image
                src={allImages[0]}
                alt="Imagen principal del post"
                fill
                className="object-contain sm:object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <ZoomIn size={24} className="text-white drop-shadow-lg" />
              </div>
            </button>

            {/* Fila de Miniaturas Compacta (si hay más de 1 foto) */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {allImages.slice(1, 4).map((src, idx) => {
                  const realIndex = idx + 1;
                  const isLastThumb = idx === 2;
                  const remainingImages = allImages.length - 4;
                  const showPlusMore = isLastThumb && remainingImages > 0;

                  return (
                    <button
                      key={realIndex}
                      onClick={() => openLightbox(realIndex)}
                      className="relative w-10 h-10 rounded-sm overflow-hidden border border-white/20 shadow-lg bg-black/50 backdrop-blur-md transition-transform hover:scale-110"
                    >
                      <Image
                        src={src}
                        alt={`Miniatura ${realIndex + 1}`}
                        fill
                        className="object-cover"
                      />
                      {showPlusMore && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-white font-bold text-[10px]">+{remainingImages}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Indicador de múltiples fotos clásico (paginación dots simulados) */}
            {allImages.length > 1 && (
              <div className="absolute -bottom-6 w-full flex justify-center gap-1.5 opacity-80 pointer-events-none">
                {allImages.slice(0, Math.min(allImages.length, 5)).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-slate-600'}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- 3 & 4. COMBINED FOOTER (Vertical Layout: Párrafo T| Acciones B) --- */}
        <div className="mx-4 mt-6 border-t border-white/5 pt-4 pb-4 flex flex-col gap-6">
           
           {/* FILA SUPERIOR: Párrafo / Caption (Full Width) */}
           <div className="w-full">
              <div className="text-[12px] leading-relaxed text-left italic text-slate-400">
                <span className="text-slate-300">
                  {(() => {
                    const fullText = displayContent.trim();
                    const MAX_LENGTH = 120; // Aumentar un poco el ancho ya que hay más espacio
                    
                    const renderWithLineBreaks = (text: string) => {
                      return text.split('\n').map((paragraph, index, arr) => (
                         <span key={index}>
                           {paragraph}
                           {index < arr.length - 1 && <br/>}
                         </span>
                      ));
                    };

                    if (!isExpanded && fullText.length > MAX_LENGTH) {
                      const truncated = fullText.slice(0, MAX_LENGTH).trim();
                      return (
                        <>
                          {renderWithLineBreaks(truncated)}
                          <span className="text-slate-400">... </span>
                          <button 
                            onClick={() => setIsExpanded(true)}
                            className="text-primary/70 font-semibold hover:text-primary ml-1"
                          >
                            Ver Más...
                          </button>
                        </>
                      );
                    }

                    return (
                      <>
                        {renderWithLineBreaks(fullText)}
                        {isExpanded && fullText.length > MAX_LENGTH && (
                           <button 
                             onClick={() => setIsExpanded(false)}
                             className="flex items-center gap-1 text-slate-500 font-medium hover:text-slate-300 mt-2 transition-colors"
                           >
                             <PiCaretUp size={14} />
                             ocultar
                           </button>
                        )}
                      </>
                    );
                  })()}
                </span>
              </div>
           </div>

           {/* FILA INFERIOR: Acciones en 3 Columnas Estilo Archivo */}
           <div className="flex items-center justify-between border-t border-white/[0.03] pt-4">
              {/* Columna 1: LIKES */}
              <div className="flex-1 flex flex-col items-center gap-2 border-r border-white/[0.03]">
                <button
                  onClick={async () => {
                    if (!currentUser) return;
                    // Actualización optimista
                    const newLiked = !isLiked;
                    setIsLiked(newLiked);
                    setLocalLoves(v => newLiked ? v + 1 : v - 1);
                    // El servidor decide el estado real (idempotente)
                    const res = await toggleLike(postId, currentUser.id);
                    if (res.success) {
                      setIsLiked(res.liked);
                    } else {
                      // Revertir si falla
                      setIsLiked(!newLiked);
                      setLocalLoves(v => newLiked ? v - 1 : v + 1);
                    }
                  }}
                  className={`transition-all duration-300 flex flex-col items-center gap-2 ${isLiked ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
                >
                  {isLiked ? (
                    <PiHeartFill size={18} className="drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                  ) : (
                    <PiHeart size={18} />
                  )}
                  <span className="text-[9px] font-black tracking-widest text-slate-600 uppercase">
                    {localLoves.toLocaleString()} LIKES
                  </span>
                </button>
              </div>

              {/* Columna 2: COMENTARIOS */}
              <div className="flex-1 flex flex-col items-center gap-2 border-r border-white/[0.03]">
                 <button 
                  onClick={() => setShowComments(!showComments)}
                  className={`flex flex-col items-center gap-2 transition-colors ${showComments ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
                 >
                   <PiChatCircle size={18} />
                   <span className="text-[9px] font-black tracking-widest text-slate-600 uppercase">
                     {reactions.comments} COMMENTS
                   </span>
                 </button>
              </div>

              {/* Columna 3: COMPARTIR */}
              <div className="flex-1 flex flex-col items-center gap-2 border-r border-white/[0.03]">
                 <button
                   onClick={async () => {
                     const url = window.location.href;
                     const text = `${user.name} en ${user.location}: ${displayContent.slice(0, 100)}`;
                     if (navigator.share) {
                       try { await navigator.share({ title: 'Peru Explorer', text, url }); } catch {}
                     } else if (navigator.clipboard?.writeText) {
                       await navigator.clipboard.writeText(url);
                       setShared(true);
                       setTimeout(() => setShared(false), 2000);
                     } else {
                       // Fallback para HTTP / navegadores sin clipboard API
                       const el = document.createElement('textarea');
                       el.value = url;
                       document.body.appendChild(el);
                       el.select();
                       document.execCommand('copy');
                       document.body.removeChild(el);
                       setShared(true);
                       setTimeout(() => setShared(false), 2000);
                     }
                   }}
                   className={`flex flex-col items-center gap-2 transition-colors ${shared ? 'text-green-400' : 'text-slate-500 hover:text-white'}`}
                 >
                   {shared ? <Check size={18} /> : <PiPaperPlaneTilt size={18} />}
                   <span className="text-[9px] font-black tracking-widest text-slate-600 uppercase">
                     {shared ? 'COPIADO' : 'SHARE'}
                   </span>
                 </button>
              </div>

              {/* Columna 4: PROMOCIONAR (Solo Dueño) */}
              {isOwner && (
                <div className="flex-1 flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500">
                  <button 
                    onClick={() => router.push(`/professional?promotePostId=${postId}`)}
                    className="flex flex-col items-center gap-2 text-primary hover:text-white transition-all group/promo"
                  >
                    <Megaphone size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black tracking-widest uppercase">
                      PROMOTE
                    </span>
                  </button>
                </div>
              )}
           </div>

            {/* --- 5. SECCIÓN DE COMENTARIOS EXPANDIBLE --- */}
           {showComments && (
             <div className="mt-4 border-t border-white/[0.03] pt-5 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Lista de Comentarios */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto px-1 custom-scrollbar mb-6">
                  {isLoadingComments ? (
                    <div className="flex justify-center py-4">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary animate-spin rounded-full" />
                    </div>
                  ) : comments.length > 0 ? (
                    comments.filter(c => !c.parentId).map((comment) => (
                      <div key={comment.id} className="flex flex-col gap-3 group/cmt">
                        <div className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                            {comment.userAvatar ? (
                               <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-600">PX</div>
                            )}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between mb-0.5 relative">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-slate-200">{comment.userName}</span>
                                  <span className="text-[9px] text-slate-600">
                                    {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {currentUser?.id === comment.userId && (
                                  <div className="flex items-center gap-3 opacity-0 group-hover/cmt:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content); }}
                                      className="text-slate-500 hover:text-white transition-colors"
                                      title="Editar"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-slate-500 hover:text-red-400 transition-colors"
                                      title="Eliminar"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                             </div>
                             {editingCommentId === comment.id ? (
                               <div className="mt-1 flex flex-col gap-2">
                                 <input
                                   type="text"
                                   autoFocus
                                   value={editCommentText}
                                   onChange={(e) => setEditCommentText(e.target.value)}
                                   onKeyDown={(e) => {
                                     if (e.key === 'Enter') handleSaveCommentEdit(comment.id);
                                     if (e.key === 'Escape') setEditingCommentId(null);
                                   }}
                                   className="w-full bg-white/[0.04] border border-white/20 rounded-md px-2 py-1 text-[12px] text-white focus:outline-none focus:border-primary/50"
                                 />
                                 <div className="flex gap-2">
                                   <button 
                                     onClick={() => handleSaveCommentEdit(comment.id)}
                                     disabled={!editCommentText.trim() || isSavingEdit}
                                     className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-sm hover:bg-primary/30"
                                   >
                                     Guardar
                                   </button>
                                   <button 
                                     onClick={() => setEditingCommentId(null)}
                                     className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5"
                                   >
                                     Cancelar
                                   </button>
                                 </div>
                               </div>
                             ) : (
                               <p className="text-[12px] text-slate-400 leading-snug">{comment.content}</p>
                             )}
                             <div className="flex items-center gap-4 mt-1.5 ml-1 text-[10px] font-bold tracking-wide text-slate-500">
                                <button 
                                  onClick={() => handleToggleCommentLike(comment.id)}
                                  className={`transition-colors flex items-center gap-1 ${comment.likedByUser ? 'text-primary' : 'hover:text-primary'}`}
                                >
                                  {comment.likedByUser ? <PiHeartFill size={11} className="drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" /> : <PiHeart size={11} className="opacity-80" />}
                                  Valorar {comment.likes > 0 && <span className="opacity-80">({comment.likes})</span>}
                                </button>
                                <button 
                                  onClick={() => setReplyingTo({ id: comment.id, name: comment.userName })}
                                  className="hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  Responder
                                </button>
                             </div>
                          </div>
                        </div>

                        {/* Respuestas anidadas */}
                        {comments.filter(c => c.parentId === comment.id).length > 0 && (
                          <div className="ml-9 space-y-3 mt-1">
                            {comments.filter(c => c.parentId === comment.id).map(reply => (
                               <div key={reply.id} className="flex gap-3 items-start group/reply">
                                  <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                                    {reply.userAvatar ? (
                                       <img src={reply.userAvatar} alt={reply.userName} className="w-full h-full object-cover" />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-600">PX</div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                     <div className="flex items-center justify-between mb-0.5 relative">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-bold text-slate-200">{reply.userName}</span>
                                          <span className="text-[9px] text-slate-600">
                                            {new Date(reply.createdAt).toLocaleDateString()} {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                        {currentUser?.id === reply.userId && (
                                          <div className="flex items-center gap-3 opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                            <button 
                                              onClick={() => { setEditingCommentId(reply.id); setEditCommentText(reply.content); }}
                                              className="text-slate-500 hover:text-white transition-colors"
                                              title="Editar"
                                            >
                                              <Pencil size={12} />
                                            </button>
                                            <button 
                                              onClick={() => handleDeleteComment(reply.id)}
                                              className="text-slate-500 hover:text-red-400 transition-colors"
                                              title="Eliminar"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        )}
                                     </div>
                                     {editingCommentId === reply.id ? (
                                       <div className="mt-1 flex flex-col gap-2">
                                         <input
                                           type="text"
                                           autoFocus
                                           value={editCommentText}
                                           onChange={(e) => setEditCommentText(e.target.value)}
                                           onKeyDown={(e) => {
                                             if (e.key === 'Enter') handleSaveCommentEdit(reply.id);
                                             if (e.key === 'Escape') setEditingCommentId(null);
                                           }}
                                           className="w-full bg-white/[0.04] border border-white/20 rounded-md px-2 py-1 text-[12px] text-white focus:outline-none focus:border-primary/50"
                                         />
                                         <div className="flex gap-2">
                                           <button 
                                             onClick={() => handleSaveCommentEdit(reply.id)}
                                             disabled={!editCommentText.trim() || isSavingEdit}
                                             className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-sm hover:bg-primary/30"
                                           >
                                             Guardar
                                           </button>
                                           <button 
                                             onClick={() => setEditingCommentId(null)}
                                             className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5"
                                           >
                                             Cancelar
                                           </button>
                                         </div>
                                       </div>
                                     ) : (
                                       <p className="text-[12px] text-slate-400 leading-snug">{reply.content}</p>
                                     )}
                                     <div className="flex items-center gap-4 mt-1.5 ml-1 text-[10px] font-bold tracking-wide text-slate-500">
                                        <button 
                                          onClick={() => handleToggleCommentLike(reply.id)}
                                          className={`transition-colors flex items-center gap-1 ${reply.likedByUser ? 'text-primary' : 'hover:text-primary'}`}
                                        >
                                          {reply.likedByUser ? <PiHeartFill size={11} className="drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" /> : <PiHeart size={11} className="opacity-80" />}
                                          Valorar {reply.likes > 0 && <span className="opacity-80">({reply.likes})</span>}
                                        </button>
                                        <button 
                                          onClick={() => setReplyingTo({ id: comment.id, name: reply.userName })}
                                          className="hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                          Responder
                                        </button>
                                     </div>
                                  </div>
                               </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-[11px] text-slate-600 italic">
                      Aún no hay visiones compartidas. Sé el primero.
                    </div>
                  )}
                </div>

                {/* Caja de Entrada de Comentario */}
                {currentUser ? (
                  <div className="space-y-2 mt-2">
                    {replyingTo && (
                      <div className="flex items-center justify-between bg-white/[0.03] px-3 py-1.5 rounded-md text-[10px] text-slate-400 border border-white/[0.05]">
                        <span>Respondiendo a <span className="font-bold text-primary">@{replyingTo.name}</span></span>
                        <button onClick={() => setReplyingTo(null)} className="hover:text-white transition-colors"><X size={12} /></button>
                      </div>
                    )}
                    <form onSubmit={handleSubmitComment} className="relative flex items-center gap-2 bg-white/[0.02] border border-white/10 focus-within:border-white/20 focus-within:bg-white/[0.04] rounded-full px-3 py-1.5 transition-all duration-300">
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 opacity-80">
                         <img src={currentUser.imageUrl} alt="Tú" className="w-full h-full object-cover" />
                      </div>
                      <input 
                        type="text"
                        autoFocus
                        placeholder={replyingTo ? `Responde a ${replyingTo.name}...` : "Añade un comentario..."}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-[12px] text-slate-300 placeholder:text-slate-600 focus:ring-0 py-0.5 leading-none"
                      />
                      <button 
                        type="submit"
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="text-primary/60 disabled:opacity-20 hover:text-primary transition-all hover:scale-110 active:scale-90 p-1 flex-shrink-0"
                      >
                        {isSubmittingComment ? (
                          <div className="w-3 h-3 border-2 border-primary/30 border-t-primary animate-spin rounded-full" />
                        ) : (
                          <PiPaperPlaneTilt size={15} />
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-2 text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                    Inicia sesión para comentar
                  </div>
                )}
             </div>
           )}
        </div>

        {/* --- 5. COMENTARIOS --- */}
        {latestComment && (
          <div className="px-4 pb-3">
             <button className="text-[13px] text-slate-500 font-medium mb-1 hover:text-slate-400">
                Ver todos los {reactions.comments} comentarios
             </button>
             <div className="text-[13px] leading-snug flex gap-1.5">
                <span className="font-semibold text-[#F1F5F9]">{latestComment.user}</span>
                <span className="text-slate-300 truncate">{latestComment.text}</span>
             </div>
          </div>
        )}
      </div>

      {/* ─── EDIT MODAL ─── */}
      {isEditing && (
        <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsEditing(false)}>
          <div
            className="w-full max-w-xl bg-slate-950 border border-white/10 shadow-2xl shadow-black rounded-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase flex items-center gap-2">
                <Pencil size={12} className="text-primary" />
                {t('community.editPost')}
              </div>
              <button onClick={() => setIsEditing(false)} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-white transition-colors rounded-sm hover:bg-white/5">
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Description textarea */}
              <div>
                <label className="block text-[9px] font-black tracking-[0.3em] text-slate-600 mb-2 uppercase">Descripción</label>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/8 rounded-sm px-4 py-3 text-sm text-white placeholder:text-slate-700 resize-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 transition-all leading-relaxed italic"
                />
              </div>

              {/* Image section */}
              <div>
                <label className="block text-[9px] font-black tracking-[0.3em] text-slate-600 mb-2 uppercase">Foto</label>
                {editImage ? (
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden border border-white/10 group/img">
                    <img src={editImage} alt="Foto del post" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/60 transition-all flex items-center justify-center gap-3 opacity-0 group-hover/img:opacity-100">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 text-[10px] font-black tracking-widest rounded-sm hover:bg-white transition-colors"
                      >
                        <ImageIcon size={12} /> Cambiar
                      </button>
                      <button
                        onClick={() => setEditImage(undefined)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/70 text-red-300 text-[10px] font-black tracking-widest rounded-sm hover:bg-red-800 transition-colors"
                      >
                        <Trash2 size={12} /> Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-3 py-8 border border-dashed border-white/10 rounded-sm text-slate-600 hover:border-primary/40 hover:text-primary transition-all"
                  >
                    <ImageIcon size={24} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold tracking-widest">Agregar foto</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-black/30">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 text-[10px] font-black tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                {t('community.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !editContent.trim()}
                className="flex items-center gap-2 px-8 py-2.5 bg-primary text-slate-900 text-[10px] font-black tracking-widest hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-primary animate-spin rounded-full" />
                ) : (
                  <Check size={13} />
                )}
                {t('community.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM ─── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDelete(false)}>
          <div
            className="w-full max-w-sm bg-slate-950 border border-white/10 shadow-2xl shadow-black rounded-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-sm font-black text-white tracking-tight mb-2">{t('community.deleteConfirm')}</h3>
              <p className="text-[11px] text-slate-500 font-medium mb-6">Esta acción no se puede deshacer.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-6 py-2.5 text-[10px] font-black tracking-widest text-slate-500 hover:text-white transition-colors border border-white/10 hover:border-white/20 rounded-sm"
                >
                  {t('community.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-red-600 text-white text-[10px] font-black tracking-widest hover:bg-red-500 transition-colors disabled:opacity-40 rounded-sm"
                >
                  {isDeleting ? (
                    <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-white animate-spin rounded-full" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  {t('community.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-all bg-black/50 backdrop-blur-md rounded-sm z-10"
            onClick={closeLightbox}
          >
            <X size={18} />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] w-full mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={allImages[lightboxIndex]}
                alt={`Imagen ${lightboxIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain border border-white/10 shadow-2xl shadow-black/80"
              />
            </div>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-slate-900 transition-all rounded-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-slate-900 transition-all rounded-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4">
            <div className="text-[9px] font-black text-slate-500 tracking-widest uppercase">
              {lightboxIndex + 1} / {allImages.length}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                    className={`w-12 h-12 relative overflow-hidden border transition-all rounded-sm ${i === lightboxIndex ? 'border-primary scale-110' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
