"use client";
import Script from 'next/script';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api, { getApiErrorMessage } from '@/lib/api';

declare global {
  interface Window {
    google?: { accounts: { id: {
      initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
      renderButton: (element: HTMLElement, options: { theme: string; size: string; text: string }) => void;
    } } };
  }
}

export default function GoogleLogin() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const target = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const router = useRouter();
  const [error, setError] = useState('');
  if (!clientId) return null;

  async function login({ credential }: { credential: string }) {
    if (busy.current) return;
    busy.current = true;
    setError('');
    try {
      const { data } = await api.post<{ access: string; refresh: string; role: string }>('/auth/google/', { id_token: credential });
      const options = { expires: 1, sameSite: 'lax' as const, secure: window.location.protocol === 'https:' };
      Cookies.set('access_token', data.access, options);
      Cookies.set('refresh_token', data.refresh, options);
      Cookies.set('user_role', data.role, options);
      window.dispatchEvent(new Event('auth-change'));
      router.push(data.role === 'admin' ? '/dashboard/admin' : data.role === 'monitor' ? '/dashboard/monitor' : '/publicacoes');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Não foi possível entrar com o Google.'));
    } finally { busy.current = false; }
  }

  return <div className="mt-6 flex flex-col items-center gap-3">
    <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onError={() => setError('Não foi possível carregar o login Google. Use seu usuário e senha.')} onReady={() => {
      if (!window.google || !target.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: login });
      window.google.accounts.id.renderButton(target.current, { theme: 'outline', size: 'large', text: 'continue_with' });
    }} />
    <div ref={target} />
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}
