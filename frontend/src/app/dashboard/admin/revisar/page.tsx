"use client";

import { ArrowLeft, Check, X, FileText, User, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function RevisarPublicacao() {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Dados mockados
  const post = {
    title: "Cartilha de Prevenção a Dengue",
    author: "Maria Oliveira",
    date: "28/09/2026",
    category: "Cartilha Educativa",
    content: "A dengue é uma doença grave... (conteúdo simulado da publicação viria aqui. O coordenador pode ler o artigo completo para decidir se o material está adequado para o portal público do PET Saúde). A prevenção depende de todos nós eliminando focos de água parada.",
    image: "https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=600&auto=format&fit=crop"
  };

  const handleApprove = () => {
    alert("Publicação Aprovada com sucesso! Ela já está disponível no portal público.");
    window.location.href = "/dashboard/admin";
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Por favor, informe o motivo da rejeição para que o monitor possa corrigir.");
      return;
    }
    alert(`Publicação Rejeitada.\nMotivo enviado ao monitor: ${rejectionReason}`);
    window.location.href = "/dashboard/admin";
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Link href="/dashboard/admin" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 w-fit transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Voltar para Fila de Aprovação</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Principal: Conteúdo da Publicação */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col gap-4">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full w-fit uppercase tracking-wider">
              {post.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
              <div className="flex items-center gap-1.5">
                <User size={16} className="text-slate-400" />
                <span className="font-medium text-slate-700">{post.author}</span> (Monitor)
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-slate-400" />
                <span>Enviado em {post.date}</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div 
              className="w-full h-64 md:h-96 rounded-xl bg-cover bg-center mb-8"
              style={{ backgroundImage: `url(${post.image})` }}
            />
            
            <div className="prose max-w-none text-slate-700 leading-relaxed">
              <p>{post.content}</p>
              <p className="mt-4">Nesta área ficará o conteúdo completo renderizado para que o coordenador possa ler e avaliar a qualidade textual, coesão, referências e adequação do material desenvolvido pelos alunos do PET Saúde.</p>
            </div>
          </div>
        </div>

        {/* Coluna Secundária: Painel de Ações */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Painel de Decisão</h3>
            <p className="text-sm text-slate-500 mb-6">Você está avaliando esta publicação. A sua decisão será enviada para o monitor responsável.</p>

            {!showRejectForm ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleApprove}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-green)] text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <Check size={18} /> Aprovar e Publicar
                </button>
                <button 
                  onClick={() => setShowRejectForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-50 transition-all shadow-sm"
                >
                  <X size={18} /> Rejeitar e Solicitar Ajustes
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4">
                <label className="text-sm font-semibold text-slate-700">Motivo da Rejeição</label>
                <textarea 
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explique ao monitor o que precisa ser corrigido..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all resize-y text-sm"
                  required
                />
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleReject}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all text-sm shadow-sm"
                  >
                    Confirmar Rejeição
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100">
              <a href="#" className="flex items-center justify-center gap-2 text-sm text-[var(--color-brand-blue-light)] font-medium hover:underline">
                <ExternalLink size={16} /> Abrir preview público
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
