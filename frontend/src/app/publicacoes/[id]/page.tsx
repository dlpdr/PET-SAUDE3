"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Share2, Download, Tag, Heart, MessageCircle, Send, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import api, { getMediaUrl } from "@/lib/api";

export default function PublicacaoDetalhe() {
  const params = useParams();
  const id = params.id;

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/publications/${id}/`);
        setPost(res.data);
        setIsLiked(res.data.is_liked || false);
        setLikesCount(res.data.likes_count || 0);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 404) {
          setError("Publicação não encontrada.");
        } else {
          setError("Erro ao carregar a publicação.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleLike = async () => {
    // Requer autenticação
    const token = document.cookie.includes('access_token');
    if (!token) {
      alert("Você precisa fazer login para curtir.");
      return;
    }

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
      alert("Erro ao registrar curtida.");
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    alert("Comentário enviado! (Simulação da integração na Fase 4)");
    setNewComment("");
  };

  const getDefaultImage = (categoria: string) => {
    if (categoria?.includes("Cartilha")) return "https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=1200&auto=format&fit=crop";
    if (categoria?.includes("Artigo")) return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=1200&auto=format&fit=crop";
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "Sem data";
    return new Date(isoStr).toLocaleDateString('pt-BR');
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

  const imagensArray = post.imagens && post.imagens.length > 0 
    ? post.imagens.map((i: any) => getMediaUrl(i.imagem))
    : [getDefaultImage(post.categoria)];

  const autorNome = post.autor ? `${post.autor.first_name} ${post.autor.last_name}` : "Autor desconhecido";

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === imagensArray.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imagensArray.length - 1 : prev - 1));
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white">
      
      <section className="w-full relative h-[40vh] min-h-[300px] flex items-end justify-center group overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-in-out"
          style={{ backgroundImage: `url(${imagensArray[currentImageIndex]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        {imagensArray.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm print:hidden"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm print:hidden"
            >
              <ChevronRight size={24} />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 print:hidden">
              {imagensArray.map((_: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}
        
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
            </div>

            <div className="flex items-center gap-4 text-white print:hidden">
              <button 
                onClick={handleLike}
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
            className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap
                       [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4
                       [&>blockquote]:border-l-4 [&>blockquote]:border-[var(--color-brand-orange)] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-500 [&>blockquote]:my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {post.texto}
          </motion.div>

          {/* Seção de Comentários */}
          <div className="mt-16 pt-12 border-t border-slate-100 print:hidden">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <MessageCircle size={28} className="text-[var(--color-brand-blue-light)]" />
              Discussão ({post.comments_count || 0})
            </h3>

            {/* Form de Comentário */}
            <form onSubmit={handleCommentSubmit} className="mb-10 flex gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-3">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] resize-y min-h-[100px]"
                  required
                />
                <button type="submit" className="self-end flex items-center gap-2 px-6 py-2.5 bg-[var(--color-brand-blue-dark)] text-white rounded-lg font-medium hover:bg-slate-800 transition-all">
                  <Send size={16} /> Comentar
                </button>
              </div>
            </form>

            {/* Lista de Comentários */}
            <div className="flex flex-col gap-6">
              {comentarios.length > 0 ? comentarios.map((comment: any) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                    {comment.autor.charAt(0)}
                  </div>
                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-sm">{comment.autor}</span>
                      <span className="text-xs text-slate-400">{comment.tempo}</span>
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
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.titulo,
                    url: window.location.href,
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copiado para a área de transferência!");
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copiado para a área de transferência!");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-blue-dark)] text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-sm print:hidden"
            >
              <Share2 size={18} /> Compartilhar
            </button>
            
            <button 
              onClick={() => window.print()}
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
