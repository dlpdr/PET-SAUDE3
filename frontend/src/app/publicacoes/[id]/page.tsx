"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Share2, Download, Tag, Heart, MessageCircle, Send, Loader2, AlertCircle, ChevronLeft, ChevronRight, Image as ImageLucide } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api, { getMediaUrl, getApiErrorStatus, getApiErrorMessage } from "@/lib/api";

import Cookies from "js-cookie";
import Image from "next/image";
import type { PublicationDetail, PublicationComment } from "@/lib/types";

export default function PublicacaoDetalhe() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busyLike, setBusyLike] = useState(false);
  const [busyComment, setBusyComment] = useState(false);
  const [busyModeration, setBusyModeration] = useState(false);
  const [motivo, setMotivo] = useState("");

  const [post, setPost] = useState<PublicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");

  const [comentarios, setComentarios] = useState<PublicationComment[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/publications/${id}/`);
        setPost(res.data);
        setRole(Cookies.get('access_token') ? Cookies.get('user_role') || 'visitante_registrado' : null);
        setIsLiked(res.data.is_liked || false);
        setLikesCount(res.data.likes_count || 0);
      } catch (err: unknown) {
        console.error(err);
        if (getApiErrorStatus(err) === 404) {
          setError("Publicação não encontrada.");
        } else {
          setError("Erro ao carregar a publicação.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await api.get(`/publications/${id}/comments/`);
        setComentarios(res.data);
      } catch (err) {
        console.error("Erro ao buscar comentários:", err);
        setFeedback("Não foi possível carregar os comentários. Tente recarregar a página.");
      }
    };

    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const handleLike = async () => {
    // Requer autenticação
    const token = Cookies.get('access_token');
    if (!token) {
      router.push("/login");
      return;
    }

    if (busyLike) return;
    setBusyLike(true);
    setFeedback("");
    const wasLiked = isLiked;
    // Otimista: atualiza a interface instantaneamente
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        await api.post(`/publications/${id}/unlike/`);
      } else {
        await api.post(`/publications/${id}/like/`);
      }
    } catch (error) {
      console.error("Erro ao curtir:", error);
      // Reverte se der erro
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      setFeedback(getApiErrorMessage(error, "Erro ao registrar curtida."));
    } finally {
      setBusyLike(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || busyComment) return;

    const token = Cookies.get('access_token');
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setBusyComment(true);
      setFeedback("");
      const res = await api.post<PublicationComment>(`/publications/${id}/comments/`, { texto: newComment.trim() });
      setComentarios(prev => [res.data, ...prev]);
      setNewComment("");
      setPost(prev => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : prev);
      setFeedback("Comentário enviado!");
    } catch (error) {
      console.error("Erro ao comentar:", error);
      setFeedback(getApiErrorMessage(error, "Erro ao enviar o comentário."));
    } finally {
      setBusyComment(false);
    }
  };

  const getDefaultImage = (categoria: string) => {
    if (categoria?.includes("Cartilha")) return "https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=1200&auto=format&fit=crop";
    if (categoria?.includes("Artigo")) return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=1200&auto=format&fit=crop";
  };

  const formatDate = (isoStr: string | null | undefined) => {
    if (!isoStr) return "Sem data";
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  const handleShare = async () => {
    if (!post) return;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: post.titulo, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareFeedback("Link copiado!");
      window.setTimeout(() => setShareFeedback(""), 2500);
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      console.error("Erro ao compartilhar publicação:", shareError);
      setShareFeedback("Não foi possível compartilhar o link.");
      window.setTimeout(() => setShareFeedback(""), 3000);
    }
  };

  const formatActivityDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
  };

  const moderate = async (action: 'approve' | 'reject') => {
    if (busyModeration || (action === 'reject' && !motivo.trim())) return;
    setBusyModeration(true);
    try {
      const result = await api.post<{ email_sent?: boolean }>(`/publications/manage/${id}/${action}/`, { motivo: motivo.trim() });
      const res = await api.get<PublicationDetail>(`/publications/${id}/`);
      setPost(res.data);
      setFeedback((action === 'approve' ? 'Publicação aprovada.' : 'Publicação rejeitada.') + (result.data.email_sent === false ? ' O e-mail não foi enviado; verifique o serviço de e-mail.' : ''));
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'Não foi possível concluir a revisão.'));
    } finally {
      setBusyModeration(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-[var(--color-brand-blue-light)]" size={48} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-500">
        <AlertCircle size={64} className="text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{error || "Publicação não encontrada"}</h1>
        <Link href="/publicacoes" className="text-[var(--color-brand-blue-light)] hover:underline">Voltar para o acervo</Link>
      </div>
    );
  }

  const capaUrl = (post.imagem_capa ? getMediaUrl(post.imagem_capa) : null) || getDefaultImage(post.categoria);
  const autorNome = post.autor ? `${post.autor.first_name} ${post.autor.last_name}` : "Autor desconhecido";
  const imagensGaleria = post.imagens || [];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white">
      {post.status !== 'publicado' && <p role="status" className="w-full bg-amber-50 p-4 text-center text-amber-900">Esta publicação está {post.status === 'pendente' ? 'em análise' : post.status === 'rascunho' ? 'em rascunho' : 'rejeitada'} e não é visível ao público.</p>}
      {role === 'admin' && post.status === 'pendente' && <div className="w-full max-w-4xl flex flex-wrap gap-3 p-4 print:hidden">
        <button disabled={busyModeration} onClick={() => moderate('approve')} className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">Aprovar</button>
        <input aria-label="Motivo da rejeição" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Motivo da rejeição" className="flex-1 rounded-lg border p-2" />
        <button disabled={busyModeration || !motivo.trim()} onClick={() => moderate('reject')} className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50">Rejeitar</button>
      </div>}
      <p role="status" className="text-center text-sm text-slate-700">{feedback}</p>
      
      <section className="w-full relative h-[40vh] min-h-[300px] flex items-end justify-center group overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-in-out"
          style={{ backgroundImage: `url(${capaUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        <div className="w-full max-w-4xl mx-auto px-6 relative z-10 pb-12">
          <Link href="/publicacoes" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm font-medium print:hidden">
            <ArrowLeft size={16} /> Voltar para o Acervo
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[var(--color-brand-blue-light)] text-white text-xs font-bold rounded-full uppercase tracking-wider">
              {post.categoria}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.titulo}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{autorNome}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(post.data_publicacao || post.criado_em)}</span>
              </div>
              {post.data_atividade && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Data da atividade: {formatActivityDate(post.data_atividade)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-white print:hidden">
              <button 
                onClick={handleLike}
                disabled={busyLike}
                aria-pressed={isLiked}
                title={role ? (isLiked ? 'Descurtir' : 'Curtir') : 'Fazer login para curtir'}
                className="flex items-center gap-2 hover:scale-110 transition-transform"
              >
                <Heart size={24} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                <span className="font-bold">{likesCount}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle size={24} />
                <span className="font-bold">{post.comments_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        
        <div className="flex-1">
          <motion.div 
            className="text-slate-800 text-lg md:text-xl leading-loose font-serif whitespace-pre-wrap
                       [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:font-sans [&>h2]:tracking-tight
                       [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:font-sans
                       [&>p]:mb-6
                       [&>blockquote]:border-l-4 [&>blockquote]:border-[var(--color-brand-blue-light)] [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>blockquote]:my-8 [&>blockquote]:bg-slate-50 [&>blockquote]:py-4 [&>blockquote]:pr-4 [&>blockquote]:rounded-r-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {post.texto}
          </motion.div>

          {post.imagens?.length > 1 && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.imagens.slice(1).map((imagem) => {
                const src = getMediaUrl(imagem.imagem);
                return src ? (
                  <figure key={imagem.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="overflow-hidden">
                      <Image unoptimized width={800} height={600} src={src} alt={imagem.descricao_acessivel || post.titulo} className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    {imagem.descricao_acessivel && <figcaption className="px-5 py-4 text-sm text-slate-600 bg-white font-sans">{imagem.descricao_acessivel}</figcaption>}
                  </figure>
                ) : null;
              })}
            </div>
          )}

          {/* Galeria de Fotos Extras */}
          {imagensGaleria.length > 0 && (
            <div className="mt-12 mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ImageLucide size={24} className="text-[var(--color-brand-blue-light)]" />
                Galeria de Fotos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagensGaleria.map((img, idx) => {
                  const mediaUrl = getMediaUrl(img.imagem);
                  return (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-100 cursor-pointer" onClick={() => mediaUrl && window.open(mediaUrl, '_blank')}>
                      <Image unoptimized src={mediaUrl || ''} alt={img.descricao_acessivel || `Foto ${idx + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        {img.descricao_acessivel && <p className="text-white text-xs font-medium line-clamp-2">{img.descricao_acessivel}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seção de Comentários */}
          <div className="mt-16 pt-12 border-t border-slate-100 print:hidden">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <MessageCircle size={28} className="text-[var(--color-brand-blue-light)]" />
              Discussão ({post.comments_count || 0})
            </h3>

            {/* Form de Comentário */}
            {role ? <form onSubmit={handleCommentSubmit} className="mb-10 flex gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-3">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] resize-y min-h-[100px]"
                  required
                />
                <button type="submit" disabled={busyComment || !newComment.trim()} className="self-end flex items-center gap-2 px-6 py-2.5 bg-[var(--color-brand-blue-dark)] text-white rounded-lg font-medium hover:bg-slate-800 transition-all">
                  <Send size={16} /> Comentar
                </button>
              </div>
            </form> : <p className="mb-8"><Link href="/login" className="text-blue-700 underline">Faça login para comentar</Link></p>}

            {/* Lista de Comentários */}
            <div className="flex flex-col gap-6">
              {comentarios.length > 0 ? comentarios.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                    {comment.autor?.first_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-sm">{comment.autor ? `${comment.autor.first_name} ${comment.autor.last_name}` : 'Usuário'}</span>
                      <span className="text-xs text-slate-400">{formatDate(comment.criado_em)}</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{comment.texto}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-sm">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 flex-shrink-0 print:hidden">
          <div className="sticky top-24 flex flex-col gap-4">
            <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-blue-dark)] text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-sm">
              <Share2 size={18} /> Compartilhar
            </button>
            <p aria-live="polite" className="min-h-5 text-center text-sm text-slate-600">{shareFeedback}</p>
            
            <button 
              onClick={() => {
                console.log("Print clicked");
                setTimeout(() => {
                  window.print();
                }, 100);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-green)] text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm print:hidden"
            >
              <Download size={18} /> Baixar PDF
            </button>

            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Tag size={16} className="text-slate-400"/> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg">{post.categoria}</span>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
