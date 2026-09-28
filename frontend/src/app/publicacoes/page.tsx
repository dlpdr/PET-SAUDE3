"use client";

import { motion } from "framer-motion";
import { Search, Filter, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AcervoPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = ["Todos", "Ação Comunitária", "Cartilha Educativa", "Artigo Acadêmico"];

  // Mock data representing approved public posts
  const publicPosts = [
    {
      id: 1,
      titulo: "Cartilha de Prevenção e Saúde Mental na Comunidade",
      resumo: "Material desenvolvido pelos monitores para auxiliar as famílias da zona rural de Afrânio nas práticas de autocuidado.",
      categoria: "Cartilha Educativa",
      data: "28 Set, 2026",
      imagem: "https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 2,
      titulo: "Ação de Conscientização na Praça Matriz",
      resumo: "Mutirão de saúde digital onde os alunos do PET auxiliaram moradores a utilizarem os aplicativos do SUS.",
      categoria: "Ação Comunitária",
      data: "15 Set, 2026",
      imagem: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 3,
      titulo: "Artigo: O impacto da tecnologia no rastreio de doenças crônicas",
      resumo: "Publicação científica dos pesquisadores do PET Saúde analisando dados colhidos no último semestre.",
      categoria: "Artigo Acadêmico",
      data: "02 Set, 2026",
      imagem: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 4,
      titulo: "Uso consciente de medicamentos na terceira idade",
      resumo: "Um guia prático sobre como organizar os medicamentos de uso contínuo e evitar interações perigosas.",
      categoria: "Cartilha Educativa",
      data: "20 Ago, 2026",
      imagem: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 5,
      titulo: "Visita Técnica ao PSF de Afrânio",
      resumo: "Registro das atividades de levantamento de dados na unidade básica de saúde municipal.",
      categoria: "Ação Comunitária",
      data: "12 Ago, 2026",
      imagem: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 6,
      titulo: "Análise Epidemiológica Regional 2026",
      resumo: "Levantamento estatístico das principais enfermidades diagnosticadas nas redes de atenção primária.",
      categoria: "Artigo Acadêmico",
      data: "01 Ago, 2026",
      imagem: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
    }
  ];

  const filteredPosts = activeCategory === "Todos" 
    ? publicPosts 
    : publicPosts.filter(post => post.categoria === activeCategory);

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
                onClick={() => setActiveCategory(cat)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.div 
              key={post.id}
              className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/publicacoes/${post.id}`} className="block relative h-48 w-full overflow-hidden bg-slate-100">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{ backgroundImage: `url(${post.imagem})` }}
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
                  <span>{post.data}</span>
                </div>
                <Link href={`/publicacoes/${post.id}`}>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[var(--color-brand-blue-light)] transition-colors line-clamp-2">
                    {post.titulo}
                  </h3>
                </Link>
                <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow">
                  {post.resumo}
                </p>
                <div className="mt-auto">
                  <Link href={`/publicacoes/${post.id}`} className="text-[var(--color-brand-blue-dark)] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ler publicação completa <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredPosts.length === 0 && (
          <div className="w-full py-20 flex flex-col items-center text-center text-slate-500">
            <Search size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium">Nenhuma publicação encontrada nessa categoria.</p>
            <button onClick={() => setActiveCategory("Todos")} className="mt-4 text-[var(--color-brand-blue-light)] hover:underline font-medium">
              Limpar filtros
            </button>
          </div>
        )}

      </section>
    </div>
  );
}
