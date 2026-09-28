"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Share2, Download, Tag, Heart, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function PublicacaoDetalhe() {
  const params = useParams();
  const id = params.id;

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(12);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    alert("Comentário enviado! (Simulação da integração na Fase 4)");
    setNewComment("");
  };

  const post = {
    titulo: "Cartilha de Prevenção e Saúde Mental na Comunidade",
    autor: "Maria Oliveira",
    data: "28 de Setembro, 2026",
    categoria: "Cartilha Educativa",
    imagem: "https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=1200&auto=format&fit=crop",
    conteudo: `
      <p>A saúde mental tem se tornado um dos temas mais urgentes nas comunidades rurais e urbanas do Vale do São Francisco. Através deste projeto do PET Saúde, realizamos um levantamento das principais necessidades e desenvolvemos um material acessível para a população.</p>
      
      <h2>1. O Papel da Informação</h2>
      <p>Muitas famílias relataram dificuldade em identificar os primeiros sinais de ansiedade e depressão. A falta de informação gera estigma e afasta os pacientes dos Postos de Saúde da Família (PSF). Nossa intervenção começou pela escuta ativa e pela criação de rodas de conversa semanais.</p>
      
      <h2>2. Resultados da Intervenção</h2>
      <p>Durante os três meses de projeto, conseguimos distribuir mais de 500 exemplares físicos da cartilha, além do acesso via QR Code nos murais da Prefeitura de Afrânio e da UNIVASF. O engajamento com os agentes comunitários de saúde foi fundamental para o sucesso dessa etapa.</p>
      
      <blockquote>"A saúde digital não é apenas sobre aplicativos, mas sobre como a informação correta chega a quem mais precisa no momento certo." - Coordenadoria do PET.</blockquote>

      <h2>3. Próximos Passos</h2>
      <p>O material agora passará por uma revisão para inclusão de conteúdos voltados à saúde do idoso, outro grupo que demonstrou grande adesão ao projeto. Fique de olho nas próximas publicações para baixar a nova versão.</p>
    `
  };

  const comentarios = [
    { id: 1, autor: "Dr. Roberto Alves", texto: "Excelente iniciativa! O material está muito didático.", tempo: "2 dias atrás" },
    { id: 2, autor: "Juliana Silva", texto: "Podemos usar essa cartilha no nosso posto de saúde?", tempo: "1 dia atrás" }
  ];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white">
      
      <section className="w-full relative h-[40vh] min-h-[300px] flex items-end justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.imagem})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        <div className="w-full max-w-4xl mx-auto px-6 relative z-10 pb-12">
          <Link href="/publicacoes" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm font-medium">
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
                <span>{post.autor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{post.data}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <button 
                onClick={handleLike}
                className="flex items-center gap-2 hover:scale-110 transition-transform"
              >
                <Heart size={24} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                <span className="font-bold">{likesCount}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle size={24} />
                <span className="font-bold">{comentarios.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        
        <div className="flex-1">
          <motion.div 
            className="text-slate-700 text-lg leading-relaxed space-y-6 
                       [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4
                       [&>blockquote]:border-l-4 [&>blockquote]:border-[var(--color-brand-orange)] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-500 [&>blockquote]:my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            dangerouslySetInnerHTML={{ __html: post.conteudo }}
          />

          {/* Seção de Comentários (Task 4.2) */}
          <div className="mt-16 pt-12 border-t border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <MessageCircle size={28} className="text-[var(--color-brand-blue-light)]" />
              Discussão ({comentarios.length})
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
              {comentarios.map((comment) => (
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
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 flex flex-col gap-4">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-blue-dark)] text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-sm">
              <Share2 size={18} /> Compartilhar
            </button>
            
            {post.categoria.includes("Cartilha") && (
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-green)] text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm">
                <Download size={18} /> Baixar PDF
              </button>
            )}

            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Tag size={16} className="text-slate-400"/> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg">Saúde Mental</span>
                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg">Comunidade</span>
                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg">Prevenção</span>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
