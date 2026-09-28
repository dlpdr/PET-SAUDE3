"use client";

import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-6">
      
      {/* Decorações de Fundo (mantendo a linguagem visual) */}
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-[var(--color-brand-blue-light)] opacity-20 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[25%] h-[25%] rounded-full bg-[var(--color-brand-green)] opacity-10 blur-[100px] -z-10 pointer-events-none" />

      <motion.div 
        className="glass-card w-full max-w-md p-8 md:p-10 flex flex-col items-center relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Detalhe de borda superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-brand-blue-dark)] via-[var(--color-brand-blue-light)] to-[var(--color-brand-orange)]" />

        <div className="h-12 w-32 relative mb-8">
          <Image src="/logos/petsaude.png" alt="PET Saúde" fill className="object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo de volta</h1>
        <p className="text-slate-500 text-sm mb-8 text-center">Entre na sua conta para acessar o acervo e interagir com as publicações.</p>

        <form className="w-full flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              placeholder="Seu e-mail acadêmico" 
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

          <div className="flex items-center justify-end mb-2">
            <a href="#" className="text-xs font-medium text-[var(--color-brand-blue-light)] hover:text-[var(--color-brand-blue-dark)] transition-colors">
              Esqueceu a senha?
            </a>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-blue-dark)] text-white rounded-xl font-medium hover:bg-slate-800 transition-all hover:shadow-lg"
          >
            Entrar <ArrowRight size={18} />
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
          Continuar com o Google
        </button>

        <p className="mt-8 text-sm text-slate-500">
          Ainda não tem uma conta?{" "}
          <Link href="/register" className="font-semibold text-[var(--color-brand-orange)] hover:text-orange-700 transition-colors">
            Cadastre-se grátis
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
