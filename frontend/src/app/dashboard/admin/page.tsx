"use client";

import { CheckSquare, Search, FileText, User, Filter, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingPosts, setPendingPosts] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const response = await api.get('/publications/pending/');
      setPendingPosts(response.data);
    } catch (error) {
      console.error("Erro ao buscar publicações pendentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Alert Header */}
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

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Publicações Pendentes</h2>
          </div>
          
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
            <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
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
                {pendingPosts.filter(p => p.titulo.toLowerCase().includes(searchTerm.toLowerCase())).map((post) => (
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
                    <td className="px-6 py-4 text-right">
                      {/* Ao invés de uma tela de revisar mockada, vamos aprovar direto por aqui pra facilitar o MVP */}
                      <button 
                        onClick={async () => {
                          if (confirm("Deseja realmente aprovar e publicar este conteúdo no site?")) {
                            await api.post(`/publications/${post.id}/approve/`);
                            fetchPending();
                          }
                        }}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <CheckSquare size={16} /> Aprovar Direto
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!isLoading && pendingPosts.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckSquare size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Você não tem publicações pendentes.</p>
            <p className="text-sm text-slate-400 mt-1">Sua fila de aprovação está vazia.</p>
          </div>
        )}
      </div>

    </div>
  );
}
