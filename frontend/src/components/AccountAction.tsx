"use client";

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

function Form({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const token = params.get('token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const needsToken = mode === 'confirm' || mode === 'reset';

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || done) return;
    if (mode === 'reset' && password !== confirmation) {
      setMessage('As senhas não coincidem.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await api.post<{ detail: string }>(`/auth/${endpoints[mode]}/`, needsToken ? { token, password } : { email });
      setMessage(response.data.detail);
      setDone(true);
      setPassword('');
      setConfirmation('');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Não foi possível concluir. Tente novamente.', ['email', 'password']));
    } finally { setBusy(false); }
  }

  return <section className="mx-auto my-12 max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
    <h1 className="mb-6 text-2xl font-bold text-slate-900">{titles[mode]}</h1>
    {needsToken && !token ? <p role="alert">Este link está incompleto. Solicite um novo e-mail.</p> : <form onSubmit={submit} className="flex flex-col gap-4">
      {!needsToken && <label className="text-sm font-medium">E-mail<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>}
      {mode === 'reset' && <>
        <label className="text-sm font-medium">Nova senha<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
        <label className="text-sm font-medium">Repita a nova senha<input type="password" required autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
      </>}
      {mode === 'confirm' && !done && <p>Confirme seu endereço de e-mail para ativar a conta.</p>}
      <button disabled={busy || done} className="rounded-lg bg-blue-900 p-3 font-medium text-white disabled:opacity-50">{busy ? 'Aguarde...' : done ? 'Concluído' : titles[mode]}</button>
    </form>}
    <p role="status" className="my-4 text-sm text-slate-700">{message}</p>
    <div className="flex flex-col gap-3 text-sm text-blue-700 underline">
      <Link href="/login">Voltar para entrar</Link>
      {mode === 'confirm' && <Link href="/reenviar-confirmacao">Solicitar novo link de confirmação</Link>}
      {mode === 'reset' && <Link href="/recuperar-senha">Solicitar novo link de recuperação</Link>}
    </div>
  </section>;
}

export default function AccountAction({ mode }: { mode: Mode }) {
  return <Suspense fallback={<p className="p-8 text-center">Carregando...</p>}><Form mode={mode} /></Suspense>;
}
