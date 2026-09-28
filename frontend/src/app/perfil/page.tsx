"use client";

import { useState } from "react";
import { Lock, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import Cookies from "js-cookie";

export default function PerfilPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'As novas senhas não coincidem.' });
      return;
    }

    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter pelo menos 8 caracteres.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      
      setFeedback({ type: 'success', message: 'Senha atualizada com sucesso! Use a nova senha no próximo login.' });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.old_password?.[0] || 
                       error.response?.data?.detail ||
                       "Erro ao alterar senha. Verifique se a senha atual está correta.";
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se não estiver logado, não deve ver a tela, idealmente um middleware resolve, mas como fallback:
  if (!Cookies.get('access_token')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <Lock size={48} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Acesso Negado</h2>
        <p className="text-slate-500 mt-2">Você precisa estar logado para acessar as configurações de segurança.</p>
        <a href="/login" className="mt-6 text-[var(--color-brand-blue-light)] hover:underline font-medium">Ir para Login</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[80vh] w-full px-6 py-12">
      
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mt-12">
        <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[var(--color-brand-blue-light)]/10 text-[var(--color-brand-blue-dark)] flex items-center justify-center">
            <Lock size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mudar Senha</h1>
            <p className="text-slate-500 mt-1">Gerencie a segurança da sua conta.</p>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Lock size={18} className="text-slate-400" /> Alterar Senha
          </h2>

          {feedback && (
            <div className={`w-full mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Senha Atual *</label>
              <input 
                type="password" 
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-semibold text-slate-700">Nova Senha *</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Confirmar Nova Senha *</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-blue-dark)] text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Nova Senha
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
