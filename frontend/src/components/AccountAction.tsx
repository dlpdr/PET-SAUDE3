"use client";

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';

type Mode = 'confirm' | 'resend' | 'request-reset' | 'reset';
const titles: Record<Mode, string> = {
  confirm: 'Confirmar e-mail', resend: 'Reenviar confirmação',
  'request-reset': 'Recuperar acesso', reset: 'Criar nova senha',
};
const endpoints: Record<Mode, string> = {
  confirm: 'confirm-email', resend: 'resend-confirmation',
  'request-reset': 'request-password-reset', reset: 'reset-password',
};
const descriptions: Record<Mode, string> = {
  confirm: 'Confirme seu endereço de e-mail para ativar a sua conta.',
  resend: 'Não recebeu o e-mail? Digite seu e-mail para enviarmos um novo link de ativação.',
  'request-reset': 'Esqueceu a senha? Enviaremos um link seguro para você redefinir seu acesso.',
  reset: 'Digite e confirme a sua nova senha para acessar a plataforma.',
};

function Form({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const token = params.get('token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [done, setDone] = useState(false);
  const needsToken = mode === 'confirm' || mode === 'reset';

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || done) return;
    if (mode === 'reset' && password !== confirmation) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const response = await api.post<{ detail: string }>(`/auth/${endpoints[mode]}/`, needsToken ? { token, password } : { email });
      setMessage({ type: 'success', text: response.data.detail });
      setDone(true);
      setPassword('');
      setConfirmation('');
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Não foi possível concluir. Tente novamente.', ['email', 'password']) });
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-6">
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-[var(--color-brand-blue-light)] opacity-20 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[25%] h-[25%] rounded-full bg-[var(--color-brand-green)] opacity-10 blur-[100px] -z-10 pointer-events-none" />

      <motion.div 
        className="glass-card w-full max-w-md p-8 md:p-10 flex flex-col items-center relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-brand-blue-dark)] via-[var(--color-brand-blue-light)] to-[var(--color-brand-orange)]" />

        <div className="h-12 w-32 relative mb-6">
          <Image src="/logos/petsaude.png" alt="PET Saúde" fill className="object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{titles[mode]}</h1>
        <p className="text-slate-500 text-sm mb-6 text-center">{descriptions[mode]}</p>

        {message && (
          <div className={`w-full mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {needsToken && !token ? (
          <div className="w-full bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-100 flex items-start gap-3 mb-6">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="font-medium text-sm">Este link está incompleto ou inválido. Solicite um novo link no seu e-mail.</span>
          </div>
        ) : (
          <form onSubmit={submit} className="w-full flex flex-col gap-4">
            {!needsToken && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--color-brand-blue-light)] transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required autoComplete="email" 
                  value={email} 
                  onChange={event => setEmail(event.target.value)} 
                  placeholder="Seu endereço de e-mail"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all shadow-sm hover:shadow-md" 
                />
              </div>
            )}
            
            {mode === 'reset' && (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--color-brand-blue-light)] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" required minLength={8} autoComplete="new-password" 
                    value={password} onChange={event => setPassword(event.target.value)} 
                    placeholder="Nova senha (mín. 8 caracteres)"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all shadow-sm hover:shadow-md" 
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--color-brand-blue-light)] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" required autoComplete="new-password" 
                    value={confirmation} onChange={event => setConfirmation(event.target.value)} 
                    placeholder="Repita a nova senha"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all shadow-sm hover:shadow-md" 
                  />
                </div>
              </>
            )}
            
            <button 
              disabled={busy || done} 
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[var(--color-brand-blue-dark)] to-[var(--color-brand-blue-light)] text-white rounded-xl font-semibold hover:shadow-[0_8px_20px_rgba(74,144,226,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : done ? <CheckCircle2 size={18} /> : <>{titles[mode]} <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 w-full">
          <Link href="/login" className="text-sm font-bold text-[var(--color-brand-blue-light)] hover:text-blue-700 transition-colors hover:underline">
            Voltar para o Login
          </Link>
          
          {mode === 'confirm' && (
            <Link href="/reenviar-confirmacao" className="text-xs font-semibold text-slate-500 hover:text-[var(--color-brand-orange)] transition-colors hover:underline mt-2">
              Não recebeu o link? Solicitar novamente
            </Link>
          )}
          {mode === 'reset' && (
            <Link href="/recuperar-senha" className="text-xs font-semibold text-slate-500 hover:text-[var(--color-brand-orange)] transition-colors hover:underline mt-2">
              Link expirado? Solicitar nova recuperação
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AccountAction({ mode }: { mode: Mode }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-slate-500 font-medium">
        <Loader2 className="animate-spin" /> Carregando formulário...
      </div>
    }>
      <Form mode={mode} />
    </Suspense>
  );
}
