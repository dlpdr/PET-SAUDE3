"use client";

import { useState, useEffect } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { UserPlus, Users, Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export default function AdminMonitoresPage() {
  const { isLoading: isCheckingAuth } = useRequireAuth("admin");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/users/');
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchUsers);
  }, []);

  const handleCreateMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, string> = {
        username,
        email,
        first_name: firstName,
        last_name: lastName
      };
      if (password) {
        payload.password = password;
      }

      const response = await api.post<{ temp_password: string; email_sent: boolean }>('/auth/monitors/', payload);
      
      const generatedPassword = response.data.temp_password;
      
      setFeedback({ 
        type: 'success', 
        message: `Monitor criado! A senha inicial é: ${generatedPassword}. ${response.data.email_sent ? 'E-mail de boas-vindas enviado.' : 'O e-mail não foi enviado. Entregue a senha ao monitor por um canal seguro.'}`
      });
      setUsername("");
      setEmail("");
      setFirstName("");
      setLastName("");
      setPassword("");
      
      void Promise.resolve().then(fetchUsers);
      
    } catch (error: unknown) {
      const detail = getApiErrorMessage(error, "Erro ao criar monitor. Verifique os dados.", ["username", "email", "password", "first_name", "last_name", "non_field_errors"]);
      setFeedback({ type: 'error', message: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/auth/users/${userId}/`, { role: newRole });
      void Promise.resolve().then(fetchUsers);
    } catch (error) {
      console.error("Erro ao atualizar papel do usuário:", error);
      alert("Erro ao atualizar o nível de acesso.");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir permanentemente este usuário?")) return;
    try {
      await api.delete(`/auth/users/${userId}/`);
      fetchUsers();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Erro ao excluir usuário.");
    }
  };

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center gap-3 text-slate-600"><Loader2 className="animate-spin" /> Verificando acesso...</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-[var(--color-brand-blue-light)]/10 text-[var(--color-brand-blue-dark)] flex items-center justify-center">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gerenciar Usuários & Monitores</h2>
          <p className="text-sm text-slate-500">Crie contas de monitores ou gerencie todos os usuários da plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Criação (Monitores) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <UserPlus size={18} className="text-[var(--color-brand-blue-light)]" />
            <h3 className="font-bold text-slate-800">Criar Monitor</h3>
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Senha (Opcional - Gerada automaticamente se vazia)</label>
                <input 
                  type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} autoComplete="new-password" aria-describedby="monitor-password-help"
                  placeholder="Defina a senha do monitor..."
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)]"
                />
                <p id="monitor-password-help" className="text-xs text-slate-500">Deixe vazio para gerar uma senha, ou use pelo menos 8 caracteres. Evite senhas comuns ou somente números.</p>
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

        {/* Lista de Usuários Gerais */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Todos os Usuários</h3>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">{users.length}</span>
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
                    <th className="px-6 py-3 font-medium">Usuário</th>
                    <th className="px-6 py-3 font-medium">Papel / Nível</th>
                    <th className="px-6 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 text-sm">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-slate-500">@{user.username} • {user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-md border-0 bg-opacity-10 cursor-pointer outline-none focus:ring-2 
                            ${user.role === 'admin' ? 'bg-purple-500 text-purple-700 focus:ring-purple-200' : 
                              user.role === 'monitor' ? 'bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue-dark)] focus:ring-blue-200' : 
                              'bg-slate-500 text-slate-700 focus:ring-slate-200'}`}
                        >
                          <option value="visitante_registrado">Visitante</option>
                          <option value="monitor">Monitor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir usuário"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm font-medium">Nenhum usuário encontrado.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
