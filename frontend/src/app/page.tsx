"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity, BookOpen, Users, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      
      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[var(--color-brand-orange)] text-sm font-medium mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          Plataforma Oficial Lançada
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight"
          {...fadeIn}
        >
          Transformando a <br className="hidden md:block"/>
          <span className="text-gradient">Informação e Saúde Digital</span>
        </motion.h1>

        <motion.p 
          className="text-lg text-slate-600 mb-10 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Uma ponte digital entre a comunidade acadêmica e a sociedade. 
          Acompanhe nossas publicações, atividades e o impacto no Vale do São Francisco.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-brand-blue-dark)] text-white rounded-full font-medium hover:bg-slate-800 transition-all hover:shadow-[0_0_20px_rgba(28,58,90,0.3)] hover:-translate-y-1">
            Faça Parte
            <ArrowRight size={18} />
          </Link>
          <Link href="#atividades" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-medium hover:bg-slate-50 hover:border-slate-300 transition-all">
            Explorar Atividades
          </Link>
        </motion.div>
      </section>

      {/* Partners Strip */}
      <section className="w-full border-y border-slate-100 bg-white/50 backdrop-blur-sm py-12" id="parceiros">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-slate-400 mb-8 uppercase tracking-widest">Realização e Parceria</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32">
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-16 w-48">
              <Image src="/logos/univasf.png" alt="UNIVASF" fill className="object-contain" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-20 w-56">
              <Image src="/logos/petsaude.png" alt="PET Saúde" fill className="object-contain" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-20 w-48">
              <Image src="/logos/afranio.png" alt="Prefeitura de Afrânio" fill className="object-contain" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="w-full max-w-6xl mx-auto px-6 py-32" id="sobre">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Nossos Pilares</h2>
          <p className="text-slate-600">Conheça a estrutura que move nosso projeto adiante.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Large */}
          <motion.div 
            className="md:col-span-2 glass-card p-8 flex flex-col justify-between group overflow-hidden relative"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={120} className="text-[var(--color-brand-blue-light)] transform rotate-12" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[var(--color-brand-blue-light)] mb-8">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-brand-blue-dark)] mb-3">Saúde Digital</h3>
              <p className="text-slate-600 max-w-md">
                Integração da tecnologia ao dia a dia da comunidade, promovendo educação em saúde com ferramentas modernas e acessíveis.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Small */}
          <motion.div 
            className="glass-card p-8 flex flex-col justify-between group bg-gradient-to-br from-[var(--color-brand-green)] to-emerald-800 text-white"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-8">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Confiabilidade</h3>
              <p className="text-emerald-50 text-sm">
                Informações revisadas por especialistas e profissionais qualificados.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Small */}
          <motion.div 
            className="glass-card p-8 flex flex-col justify-between group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-[var(--color-brand-orange)] mb-8">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Publicações</h3>
              <p className="text-slate-600 text-sm">
                Acervo de cartilhas, artigos e informativos abertos ao público.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Medium */}
          <motion.div 
            className="md:col-span-2 glass-card p-8 flex flex-col justify-between group bg-slate-900 text-white relative overflow-hidden"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
             <div className="absolute -bottom-10 -right-10 opacity-10">
              <Users size={200} />
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-white mb-8">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Extensão Universitária</h3>
              <p className="text-slate-400 max-w-md">
                Conectando alunos, professores e a rede pública de saúde de Afrânio para gerar impacto real e duradouro.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
