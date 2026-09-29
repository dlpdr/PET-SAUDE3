"use client";

import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import GoogleLogin from "@/components/GoogleLogin";

export default function RegisterPage() {
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (password !== passwordConfirm) {
      setFeedback({ type: 'error', message: 'As senhas não coincidem.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/register/', {
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
        password_confirm: passwordConfirm
      });
      
      setFeedback({ type: 'success', message: 'Conta criada! Confira seu e-mail e use o link recebido para ativar a conta antes de entrar.' });
      setPassword('');
      setPasswordConfirm('');
      
    } catch (error: unknown) {
      console.error(error);
      const errorMsg = getApiErrorMessage(error, "Erro ao criar conta. Verifique os dados.", ["username", "email", "password"]);
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <p className="text-slate-500 text-sm mb-6 text-center">Faça parte da nossa plataforma acadêmica e tenha acesso às atividades.</p>

        {feedback && (
          <div className={`w-full mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="w-full flex flex-col gap-5">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="relative group flex-1">
              <input 
                type="text" 
                placeholder="Nome" 
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all shadow-sm hover:shadow-md"
                required
              />
            </div>
            <div className="relative group flex-1">
              <input 
                type="text" 
                placeholder="Sobrenome" 
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all shadow-sm hover:shadow-md"
                required
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--color-brand-blue-light)] transition-colors">
              <User size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Nome de Usuário (ex: joao123)" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all shadow-sm hover:shadow-md"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--color-brand-blue-light)] transition-colors">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              placeholder="E-mail (preferencialmente acadêmico)" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all shadow-sm hover:shadow-md"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--color-brand-blue-light)] transition-colors">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              placeholder="Sua senha" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all shadow-sm hover:shadow-md"
              required
            />
          </div>

          <div className="relative group mb-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--color-brand-blue-light)] transition-colors">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              placeholder="Confirme a senha" 
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all shadow-sm hover:shadow-md"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[var(--color-brand-orange)] to-orange-500 text-white rounded-xl font-semibold hover:shadow-[0_8px_20px_rgba(232,93,34,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Cadastrar <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="w-full mt-8 mb-6 flex items-center justify-center">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="px-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">Ou continue com</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <GoogleLogin />

        <p className="mt-8 text-sm text-slate-500 font-medium">
          Já possui uma conta?{" "}
          <Link href="/login" className="font-bold text-[var(--color-brand-blue-light)] hover:text-blue-700 transition-colors hover:underline">
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
