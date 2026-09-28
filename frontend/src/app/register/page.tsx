"use client";

import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-6 my-12">
      
      {/* Decorações de Fundo */}
      <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-[var(--color-brand-orange)] opacity-10 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[25%] h-[25%] rounded-full bg-[var(--color-brand-blue-light)] opacity-20 blur-[100px] -z-10 pointer-events-none" />

      <motion.div 
        className="glass-card w-full max-w-md p-8 md:p-10 flex flex-col items-center relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Detalhe de borda superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-brand-orange)] via-[var(--color-brand-blue-light)] to-[var(--color-brand-blue-dark)]" />

        <div className="h-12 w-32 relative mb-6">
          <Image src="/logos/petsaude.png" alt="PET Saúde" fill className="object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Crie sua conta</h1>
        <p className="text-slate-500 text-sm mb-8 text-center">Faça parte da nossa plataforma acadêmica e tenha acesso às atividades.</p>

        <form className="w-full flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Nome" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Sobrenome" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              placeholder="E-mail (preferencialmente acadêmico)" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              placeholder="Sua senha" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              placeholder="Confirme a senha" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-orange)] text-white rounded-xl font-medium hover:bg-orange-600 transition-all hover:shadow-lg"
          >
            Cadastrar <ArrowRight size={18} />
          </button>
        </form>

        <div className="w-full flex items-center gap-4 my-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">ou</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <button 
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm"
        >
          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
          Cadastrar com Google
        </button>

        <p className="mt-8 text-sm text-slate-500">
          Já possui uma conta?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-brand-blue-light)] hover:text-blue-700 transition-colors">
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
