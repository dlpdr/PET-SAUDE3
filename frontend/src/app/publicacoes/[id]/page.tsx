"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Share2, Download, Tag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PublicacaoDetalhe() {
  const params = useParams();
  const id = params.id;

  // Em um cenário real, faríamos fetch na API do Django usando este 'id'
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

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white">
      
      {/* Hero Image / Header */}
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
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Article Body */}
        <div className="flex-1">
          {/* Usando tipografia padrão HTML (prose simulada com classes tailwind normais já que não instalamos o plugin typography para evitar erros) */}
          <motion.div 
            className="text-slate-700 text-lg leading-relaxed space-y-6 
                       [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4
                       [&>blockquote]:border-l-4 [&>blockquote]:border-[var(--color-brand-orange)] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-500 [&>blockquote]:my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            dangerouslySetInnerHTML={{ __html: post.conteudo }}
          />
        </div>

        {/* Sidebar Actions */}
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
