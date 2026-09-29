"use client";

import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { getApiErrorMessage } from "@/lib/api";
import Cookies from "js-cookie";
import GoogleLogin from '@/components/GoogleLogin';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Endpoint que configuramos na AWS para JWT
      const response = await api.post('/auth/login/', {
        username: email, // O backend Django espera 'username'
        password
      });

      const { access, refresh, role } = response.data;
      
      // Salva os tokens e o tipo de usuário nos cookies (válidos por 1 dia)
      const options = { expires: 1, sameSite: 'lax' as const, secure: window.location.protocol === 'https:' };
      Cookies.set('access_token', access, options);
      Cookies.set('refresh_token', refresh, options);
      Cookies.set('user_role', role, options);
      window.dispatchEvent(new Event('auth-change'));

      // Redireciona baseado no role
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'monitor') {
        router.push('/dashboard/monitor');
      } else {
        router.push('/publicacoes'); // visitante comum
      }
      
    } catch (error: unknown) {
      console.error(error);
      setErrorMsg(getApiErrorMessage(error, "Falha ao entrar. Verifique seu e-mail e senha."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-6">
      
      {/* Decorações de Fundo */}
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-[var(--color-brand-blue-light)] opacity-20 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[25%] h-[25%] rounded-full bg-[var(--color-brand-green)] opacity-10 blur-[100px] -z-10 pointer-events-none" />

      <motion.div 
        className="glass-card w-full max-w-md p-8 md:p-10 flex flex-col items-center relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-brand-blue-dark)] via-[var(--color-brand-blue-light)] to-[var(--color-brand-orange)]" />

        <div className="h-12 w-32 relative mb-8">
          <Image src="/logos/petsaude.png" alt="PET Saúde" fill className="object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo de volta</h1>
        <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm text-blue-700 underline">
          <Link href="/recuperar-senha">Esqueci minha senha</Link>
          <Link href="/reenviar-confirmacao">Reenviar confirmação de e-mail</Link>
        </div>
        <p className="text-slate-500 text-sm mb-8 text-center">Entre na sua conta para acessar o acervo e interagir com as publicações.</p>

        {errorMsg && (
          <div className="w-full bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail ou nome de usuário (ex: admin)" 
              aria-label="E-mail ou nome de usuário" autoComplete="username"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha" 
              aria-label="Senha" autoComplete="current-password"
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
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-blue-dark)] text-white rounded-xl font-medium hover:bg-slate-800 transition-all hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Entrar <ArrowRight size={18} /></>}
          </button>
        </form>

        <GoogleLogin />

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
