"use client";

import { CheckSquare, Search, FileText, User, AlertCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface Publication {
  id: number;
  titulo: string;
  autor: {
    first_name: string;
    last_name: string;
  };
  criado_em: string;
  categoria: string;
  status: string;
}

export default function AdminDashboard() {
  const { isLoading: isCheckingAuth } = useRequireAuth("admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"pendentes" | "publicados">("pendentes");
  const [pendingPosts, setPendingPosts] = useState<Publication[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [stats, setStats] = useState<{ total_publicadas: number; total_pendentes: number; total_curtidas: number; total_usuarios: number } | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loadError, setLoadError] = useState(false);
  
  const currentPosts = activeTab === "pendentes" ? pendingPosts : publishedPosts;
  const visiblePosts = currentPosts.filter(post => post.titulo.toLowerCase().includes(searchTerm.toLowerCase()));

  const fetchPosts = async () => {
    setLoadError(false);
    try {
      const [pendingResponse, publishedResponse, statsResponse] = await Promise.all([
        api.get('/publications/manage/pending/'),
        api.get('/publications/manage/?status=publicado'),
        api.get('/publications/manage/stats/')
      ]);
      setPendingPosts(pendingResponse.data);
      // DRF with pagination returns results array
      setPublishedPosts(publishedResponse.data.results || publishedResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setFeedback("Não foi possível carregar todos os dados do painel.");
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchPosts);
  }, []);

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  const handleApprove = async (id: number) => {
    if (confirm("Deseja realmente aprovar e publicar este conteúdo no site?")) {
      setActionLoading(id);
      try {
        const result = await api.post<{ email_sent?: boolean }>(`/publications/manage/${id}/approve/`);
        setFeedback(result.data.email_sent === false ? 'Publicação aprovada, mas o e-mail não foi enviado. Verifique o serviço de e-mail.' : 'Publicação aprovada e autor notificado.');
        fetchPosts();
      } catch (error) {
        console.error("Erro ao aprovar:", error);
        setFeedback("Erro ao aprovar a publicação. Tente novamente.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleReject = async (id: number) => {
    const motivo = rejectionReason;
    if (motivo?.trim()) {
      setActionLoading(id);
      try {
        const result = await api.post<{ email_sent?: boolean }>(`/publications/manage/${id}/reject/`, { motivo });
        setFeedback(result.data.email_sent === false ? 'Publicação rejeitada, mas o e-mail não foi enviado. Verifique o serviço de e-mail.' : 'Publicação rejeitada e autor notificado.');
        setRejectingId(null);
        setRejectionReason('');
        fetchPosts();
      } catch (error) {
        console.error("Erro ao rejeitar:", error);
        setFeedback("Erro ao rejeitar a publicação. Tente novamente.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleTirarDoAr = async (id: number) => {
    const motivo = prompt("Tem certeza que deseja TIRAR ESTA PUBLICAÇÃO DO AR? Informe o motivo:");
    if (motivo !== null) {
      setActionLoading(id);
      try {
        await api.post(`/publications/manage/${id}/reject/`, { motivo: `Removido do ar pelo Admin: ${motivo}` });
        setFeedback("Publicação removida do ar com sucesso!");
        setTimeout(() => setFeedback(""), 3000);
        fetchPosts();
      } catch (error) {
        console.error("Erro ao tirar do ar:", error);
        setFeedback("Erro ao tirar a publicação do ar.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center gap-3 text-slate-600"><Loader2 className="animate-spin" /> Verificando acesso...</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {feedback && <p role="status" className="text-slate-700">{feedback}</p>}
      {rejectingId !== null && <form onSubmit={event => { event.preventDefault(); void handleReject(rejectingId); }} className="rounded-xl border border-red-200 bg-red-50 p-5">
        <label htmlFor="rejection-reason" className="font-semibold text-red-900">Motivo da rejeição: {pendingPosts.find(post => post.id === rejectingId)?.titulo}</label>
        <textarea id="rejection-reason" required value={rejectionReason} onChange={event => setRejectionReason(event.target.value)} className="my-3 w-full rounded-lg border bg-white p-3" />
        <div className="flex gap-3"><button disabled={actionLoading !== null || !rejectionReason.trim()} className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50">Confirmar rejeição</button><button type="button" disabled={actionLoading !== null} onClick={() => { setRejectingId(null); setRejectionReason(''); }} className="rounded-lg border px-4 py-2">Cancelar</button></div>
      </form>}
      {stats && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Publicadas', stats.total_publicadas], ['Em análise', stats.total_pendentes],
          ['Curtidas', stats.total_curtidas], ['Usuários', stats.total_usuarios],
        ].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-800">{value}</p></div>)}
      </div>}
      
      {/* Alert Header */}
      {activeTab === 'pendentes' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <AlertCircle className="text-amber-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <h2 className="text-amber-800 font-bold text-lg mb-1">Fila de Aprovação ({pendingPosts.length})</h2>
            <p className="text-amber-700 text-sm">
              Existem {pendingPosts.length} publicações enviadas pelos monitores aguardando a sua revisão. 
              Revise cuidadosamente antes de publicar no portal oficial.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-slate-100 bg-slate-50 flex">
          <button 
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pendentes' ? 'border-[var(--color-brand-blue-dark)] text-[var(--color-brand-blue-dark)]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('pendentes')}
          >
            Fila de Aprovação ({pendingPosts.length})
          </button>
          <button 
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'publicados' ? 'border-[var(--color-brand-blue-dark)] text-[var(--color-brand-blue-dark)]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('publicados')}
          >
            Conteúdo Online ({publishedPosts.length})
          </button>
        </div>

        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar publicação..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)]"
              />
            </div>
          </div>
        </div>

        {loadError ? <button onClick={() => void fetchPosts()} className="p-6 text-blue-700 underline">Tentar carregar o painel novamente</button> : isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="px-6 py-4 font-medium">Publicação</th>
                  <th className="px-6 py-4 font-medium">Autor / Monitor</th>
                  <th className="px-6 py-4 font-medium">Data de Envio</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visiblePosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{post.titulo}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <FileText size={12} /> {post.categoria}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" /> {post.autor?.first_name} {post.autor?.last_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(post.criado_em)}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <Link 
                        href={`/publicacoes/${post.id}`}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-slate-50 text-[var(--color-brand-blue-light)] text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                      >
                        Visualizar
                      </Link>

                      {activeTab === 'pendentes' && (
                        <>
                          <button 
                            onClick={() => { setRejectingId(post.id); setRejectionReason(''); }}
                            disabled={actionLoading === post.id}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === post.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />} 
                            Rejeitar
                          </button>
                          <button 
                            onClick={() => handleApprove(post.id)}
                            disabled={actionLoading === post.id}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === post.id ? <Loader2 size={16} className="animate-spin" /> : <CheckSquare size={16} />} 
                            Aprovar
                          </button>
                        </>
                      )}

                      {activeTab === 'publicados' && (
                        <button 
                          onClick={() => handleTirarDoAr(post.id)}
                          disabled={actionLoading === post.id}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-orange-50 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === post.id ? <Loader2 size={16} className="animate-spin" /> : <AlertCircle size={16} />} 
                          Tirar do Ar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loadError && !isLoading && visiblePosts.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckSquare size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">{pendingPosts.length ? 'Nenhuma publicação corresponde à busca.' : 'Você não tem publicações pendentes.'}</p>
          </div>
        )}
      </div>

    </div>
  );
}
