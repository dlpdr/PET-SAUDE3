"use client";

import { motion } from "framer-motion";
import { Search, Filter, Calendar, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import api, { getMediaUrl } from "@/lib/api";
import type { PublicationSummary, PaginatedResponse } from "@/lib/types";

export default function AcervoPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [publicPosts, setPublicPosts] = useState<PublicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const categories = ["Todos", "Ação Comunitária", "Cartilha Educativa", "Artigo Acadêmico"];

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get<PaginatedResponse<PublicationSummary> | PublicationSummary[]>('/publications/', {
          params: { page, ordering: '-data_publicacao', search: searchTerm.trim(), ...(activeCategory !== 'Todos' ? { categoria: activeCategory } : {}) },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const data = res.data;
        setPublicPosts(Array.isArray(data) ? data.slice((page - 1) * 9, page * 9) : data.results);
        setCount(Array.isArray(data) ? data.length : data.count);
      } catch {
        if (!controller.signal.aborted) setError('Não foi possível carregar as publicações.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [page, activeCategory, searchTerm, retry]);

  const filteredPosts = publicPosts;

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "Sem data";
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  const getDefaultImage = (categoria: string) => {
    if (categoria.includes("Cartilha")) return "https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=600&auto=format&fit=crop";
    if (categoria.includes("Artigo")) return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=600&auto=format&fit=crop";
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      
      {/* Header Section */}
      <section className="w-full bg-[var(--color-brand-blue-dark)] text-white pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-orange)] opacity-20 blur-[150px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Acervo de Publicações</h1>
          <p className="text-blue-100 max-w-2xl text-lg mb-10">
            Explore nossas ações comunitárias, baixe cartilhas educativas e leia os artigos produzidos por nossos pesquisadores e monitores.
          </p>

          <div className="w-full max-w-2xl relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Buscar por título, palavra-chave ou autor..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-blue-light)] transition-all"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12">
        
        {/* Filtros */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={20} className="text-slate-400 mr-2" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat 
                    ? "bg-[var(--color-brand-blue-light)] text-white shadow-md" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Publicações */}
        {error ? <div role="alert" className="p-8 text-center text-red-700">{error} <button onClick={() => setRetry(value => value + 1)} className="underline">Tentar novamente</button></div> : isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[var(--color-brand-blue-light)]" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div 
                key={post.id}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2 flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
              >
                <Link href={`/publicacoes/${post.id}`} className="block relative h-56 w-full overflow-hidden bg-slate-100">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                    style={{ backgroundImage: `url(${(post.imagem_capa ? getMediaUrl(post.imagem_capa) : null) || getDefaultImage(post.categoria)})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-5">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-[var(--color-brand-blue-dark)] text-xs font-bold rounded-full shadow-sm">
                      {post.categoria}
                    </span>
                  </div>
                </Link>
                <div className="p-8 flex flex-col flex-grow relative bg-white">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4 font-medium">
                    <Calendar size={15} />
                    <span>{formatDate(post.data_publicacao)}</span>
                  </div>
                  <Link href={`/publicacoes/${post.id}`}>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[var(--color-brand-blue-light)] transition-colors line-clamp-2 leading-tight">
                      {post.titulo}
                    </h3>
                  </Link>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed">
                    {post.texto.length > 150 ? post.texto.substring(0, 150) + "..." : post.texto}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <Link href={`/publicacoes/${post.id}`} className="text-[var(--color-brand-blue-dark)] font-semibold text-sm flex items-center gap-1 group-hover:gap-3 transition-all duration-300">
                      Ler publicação completa <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!error && !isLoading && filteredPosts.length === 0 && (
          <div className="w-full py-20 flex flex-col items-center text-center text-slate-500">
            <Search size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium">Nenhuma publicação encontrada.</p>
            <button onClick={() => {setActiveCategory("Todos"); setSearchTerm(""); setPage(1);}} className="mt-4 text-[var(--color-brand-blue-light)] hover:underline font-medium">
              Limpar filtros
            </button>
          </div>
        )}

        {!error && count > 9 && <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-6">
          <button disabled={isLoading || page === 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Página anterior</button>
          <span aria-live="polite">Página {page} de {Math.ceil(count / 9)}</span>
          <button disabled={isLoading || page >= Math.ceil(count / 9)} onClick={() => setPage(value => value + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Próxima página</button>
        </nav>}
      </section>
    </div>
  );
}
