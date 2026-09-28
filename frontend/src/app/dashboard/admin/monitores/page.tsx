"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { UserPlus, Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Monitor {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function AdminMonitoresPage() {
  const [monitores, setMonitores] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchMonitores = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/monitors/');
      setMonitores(response.data);
    } catch (error) {
      console.error("Erro ao buscar monitores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitores();
  }, []);

  const handleCreateMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/monitors/', {
        username,
        email,
        first_name: firstName,
        last_name: lastName
      });
      
      const generatedPassword = response.data.temp_password;
      
      setFeedback({ 
        type: 'success', 
        message: `Monitor criado com sucesso! A senha gerada para o primeiro login é: ${generatedPassword || 'Enviada por e-mail'}` 
      });
      setUsername("");
      setEmail("");
      setFirstName("");
      setLastName("");
      
      // Refresh list
      fetchMonitores();
      
    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.username?.[0] || error.response?.data?.detail || "Erro ao criar monitor. Verifique os dados.";
      setFeedback({ type: 'error', message: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-[var(--color-brand-blue-light)]/10 text-[var(--color-brand-blue-dark)] flex items-center justify-center">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gerenciar Monitores</h2>
          <p className="text-sm text-slate-500">Crie novas contas de monitores ou visualize os monitores ativos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Criação */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <UserPlus size={18} className="text-[var(--color-brand-blue-light)]" />
            <h3 className="font-bold text-slate-800">Novo Monitor</h3>
          </div>
          <div className="p-6">
            
            {feedback && (
              <div className={`mb-4 p-3 rounded-xl flex items-start gap-2 text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateMonitor} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Nome de Usuário *</label>
                <input 
                  type="text" value={username} onChange={e => setUsername(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">E-mail *</label>
                <input 
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nome *</label>
                  <input 
                    type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Sobrenome *</label>
                  <input 
                    type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)]"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-[var(--color-brand-blue-dark)] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                Cadastrar Monitor
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Monitores */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Monitores Ativos</h3>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">{monitores.length}</span>
          </div>
          
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3 font-medium">Nome Completo</th>
                    <th className="px-6 py-3 font-medium">Usuário</th>
                    <th className="px-6 py-3 font-medium">E-mail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monitores.map((monitor) => (
                    <tr key={monitor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 text-sm">{monitor.first_name} {monitor.last_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        @{monitor.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {monitor.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {monitores.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm font-medium">Nenhum monitor cadastrado ainda.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
