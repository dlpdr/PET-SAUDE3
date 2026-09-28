"use client";

import { CheckSquare, Search, FileText, User, Filter, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const pendingPosts = [
    { 
      id: 1, 
      title: "Cartilha de Prevenção a Dengue", 
      author: "Maria Oliveira", 
      date: "28/09/2026", 
      category: "Cartilha Educativa",
      status: "pendente"
    },
    { 
      id: 2, 
      title: "Relatório da Ação na Praça Matriz", 
      author: "João Silva", 
      date: "25/09/2026", 
      category: "Ação Comunitária",
      status: "pendente"
    },
    { 
      id: 3, 
      title: "Uso consciente de medicamentos", 
      author: "Ana Costa", 
      date: "24/09/2026", 
      category: "Artigo Acadêmico",
      status: "pendente"
    },
  ];

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
              {pendingPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{post.title}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <FileText size={12} /> {post.category}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 flex items-center gap-1.5">
                      <User size={14} className="text-slate-400" /> {post.author}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{post.date}</td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/dashboard/admin/revisar`} 
                      className="inline-flex items-center gap-1 px-4 py-2 bg-blue-50 text-[var(--color-brand-blue-dark)] text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <CheckSquare size={16} /> Revisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {pendingPosts.length === 0 && (
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
