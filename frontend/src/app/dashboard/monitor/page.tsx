"use client";

import { Clock, CheckCircle2, XCircle, FileEdit, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function MonitorDashboard() {
  // Dados mockados para ilustrar a interface até a integração
  const stats = [
    { label: "Publicados", value: 12, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
    { label: "Em Análise", value: 3, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Rascunhos", value: 2, icon: FileEdit, color: "text-slate-600", bg: "bg-slate-100" },
    { label: "Rejeitados", value: 1, icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
  ];

  const recentPosts = [
    { id: 1, title: "Cartilha de Saúde Mental", date: "28/09/2026", status: "publicado" },
    { id: 2, title: "Ação Comunitária em Afrânio", date: "25/09/2026", status: "pendente" },
    { id: 3, title: "Artigo: Uso de Tecnologias no SUS", date: "20/09/2026", status: "rejeitado", motivo: "Faltam referências bibliográficas na página 2." },
    { id: 4, title: "Dicas de Alimentação Saudável", date: "18/09/2026", status: "rascunho" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "publicado":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Publicado</span>;
      case "pendente":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Em Análise</span>;
      case "rejeitado":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejeitado</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Rascunho</span>;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Minhas Publicações</h2>
            <p className="text-sm text-slate-500">Gerencie seus rascunhos e acompanhe o status de aprovação.</p>
          </div>
          <Link 
            href="/dashboard/monitor/nova-publicacao" 
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-blue-dark)] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Nova Publicação <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="px-6 py-4 font-medium">Título da Publicação</th>
                <th className="px-6 py-4 font-medium">Data de Criação</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{post.title}</p>
                    {post.motivo && (
                      <p className="text-xs text-red-500 mt-1">Motivo: {post.motivo}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{post.date}</td>
                  <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[var(--color-brand-blue-light)] hover:text-blue-800 text-sm font-medium transition-colors">
                      {post.status === "rascunho" || post.status === "rejeitado" ? "Editar" : "Visualizar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {recentPosts.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <FileEdit size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Você ainda não tem nenhuma publicação.</p>
            <Link 
              href="/dashboard/monitor/nova-publicacao" 
              className="mt-4 text-[var(--color-brand-blue-light)] font-medium hover:underline"
            >
              Criar minha primeira publicação
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
