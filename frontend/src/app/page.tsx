"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, HeartPulse, Megaphone, FileText, Calendar, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import api, { getMediaUrl } from "@/lib/api";

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/publications/?ordering=-data_publicacao');
        // Pega as 3 mais recentes
        setRecentPosts(res.data.slice(0, 3));
      } catch (err) {
        console.error("Erro ao buscar publicações recentes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "Sem data";
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  const getDefaultImage = (categoria: string) => {
    if (categoria?.includes("Cartilha")) return "https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=600&auto=format&fit=crop";
    if (categoria?.includes("Artigo")) return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=600&auto=format&fit=crop";
  };

  return (
    <div className="flex flex-col items-center justify-center w-full overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center">
        <motion.div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[var(--color-brand-blue-dark)] text-sm font-medium mb-8 shadow-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Portal de Publicações Online
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight"
          {...fadeIn}
        >
          Descubra os trabalhos do <br className="hidden md:block"/>
          <span className="text-gradient">PET Saúde</span>
        </motion.h1>

        <motion.p 
          className="text-lg text-slate-600 mb-10 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Nossa vitrine oficial de ações comunitárias, cartilhas educativas e artigos científicos desenvolvidos no Vale do São Francisco.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="#publicacoes" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-brand-blue-dark)] text-white rounded-full font-medium hover:bg-slate-800 transition-all hover:shadow-[0_0_20px_rgba(28,58,90,0.3)] hover:-translate-y-1">
            Ver Publicações
            <ArrowRight size={18} />
          </Link>
          <Link href="#tipos" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-medium hover:bg-slate-50 hover:border-slate-300 transition-all">
            Conhecer o Acervo
          </Link>
        </motion.div>
      </section>

      {/* Partners Strip */}
      <section className="w-full border-y border-slate-100 bg-white/50 backdrop-blur-sm py-10" id="parceiros">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-slate-400 mb-6 uppercase tracking-widest">Realização e Parcerias Oficiais</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32">
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-14 w-40">
              <Image src="/logos/univasf.png" alt="UNIVASF" fill className="object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-16 w-48">
              <Image src="/logos/petsaude.png" alt="PET Saúde" fill className="object-contain" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-16 w-40">
              <Image src="/logos/afranio.png" alt="Prefeitura de Afrânio" fill className="object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Publications Vitrine */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24" id="publicacoes">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Trabalhos Recentes</h2>
            <p className="text-slate-600">Acompanhe as últimas atualizações, eventos e materiais publicados.</p>
          </div>
          <Link href="/publicacoes" className="text-[var(--color-brand-orange)] font-medium flex items-center gap-2 hover:gap-3 transition-all">
            Ver todo o acervo <ArrowRight size={18} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[var(--color-brand-blue-light)]" size={48} />
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <p className="text-lg font-medium">Em breve novidades!</p>
            <p className="text-sm">Nenhuma publicação encontrada no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentPosts.map((post, index) => (
              <motion.div 
                key={post.id}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/publicacoes/${post.id}`} className="block relative h-48 w-full overflow-hidden bg-slate-100">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                    style={{ backgroundImage: `url(${getMediaUrl(post.imagens?.[0]?.imagem) || getDefaultImage(post.categoria)})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[var(--color-brand-blue-dark)] text-xs font-bold rounded-full">
                      {post.categoria}
                    </span>
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                    <Calendar size={14} />
                    <span>{formatDate(post.data_publicacao)}</span>
                  </div>
                  <Link href={`/publicacoes/${post.id}`}>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[var(--color-brand-blue-light)] transition-colors line-clamp-2">
                      {post.titulo}
                    </h3>
                  </Link>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow" dangerouslySetInnerHTML={{ __html: post.texto.substring(0, 150) + "..." }} />
                  <div className="mt-auto">
                    <Link href={`/publicacoes/${post.id}`} className="text-[var(--color-brand-blue-dark)] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ler mais <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Tipos de Conteúdo (Bento Grid) */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-32" id="tipos">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">O que você encontra aqui?</h2>
          <p className="text-slate-600">Nossa plataforma organiza e centraliza todo o conhecimento gerado.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <motion.div 
            className="md:col-span-2 glass-card p-8 flex flex-col justify-between group overflow-hidden relative"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <HeartPulse size={120} className="text-[var(--color-brand-blue-light)] transform rotate-12" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[var(--color-brand-blue-light)] mb-8">
              <Megaphone size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-brand-blue-dark)] mb-3">Ações Comunitárias</h3>
              <p className="text-slate-600 max-w-md">
                Acompanhe o cronograma, fotos e resultados das nossas intervenções diretas nos bairros e na zona rural de Afrânio, levando saúde digital na prática.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            className="glass-card p-8 flex flex-col justify-between group bg-gradient-to-br from-[var(--color-brand-green)] to-emerald-800 text-white"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-8">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Cartilhas Educativas</h3>
              <p className="text-emerald-50 text-sm">
                Materiais didáticos ilustrados, prontos para download, focados em conscientização.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            className="glass-card p-8 flex flex-col justify-between group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-[var(--color-brand-orange)] mb-8">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Produção Científica</h3>
              <p className="text-slate-600 text-sm">
                Artigos, resumos e pesquisas desenvolvidas pelos monitores e preceptores do projeto.
              </p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            className="md:col-span-2 glass-card p-8 flex flex-col justify-between group bg-slate-900 text-white relative overflow-hidden"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-white mb-8">
              <ArrowRight size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Área do Monitor</h3>
              <p className="text-slate-400 max-w-md">
                Plataforma interna para criação, revisão e aprovação de novas publicações. Os monitores enviam os rascunhos e os coordenadores aprovam direto pelo sistema.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
