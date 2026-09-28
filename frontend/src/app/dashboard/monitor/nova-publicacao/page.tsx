"use client";

import { ArrowLeft, UploadCloud, Save, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NovaPublicacao() {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [texto, setTexto] = useState("");

  const handleSubmit = (e: React.FormEvent, status: "rascunho" | "pendente") => {
    e.preventDefault();
    // Simulação do Submit - Posteriormente integrará com a API do Django
    alert(`Publicação salva como: ${status}\nTítulo: ${titulo}`);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Link href="/dashboard/monitor" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 w-fit transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Voltar para o Painel</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Detalhes da Publicação</h2>
          <p className="text-sm text-slate-500 mt-1">Preencha os dados abaixo. Você pode salvar como rascunho e terminar depois.</p>
        </div>

        <div className="p-6 md:p-8">
          <form className="flex flex-col gap-6">
            
            {/* Título e Categoria */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Título da Publicação *</label>
                <input 
                  type="text" 
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Ação na UBS do Centro" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="md:w-1/3 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Categoria *</label>
                <select 
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all text-slate-700"
                  required
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="acao">Ação Comunitária</option>
                  <option value="cartilha">Cartilha Educativa</option>
                  <option value="artigo">Artigo Acadêmico</option>
                </select>
              </div>
            </div>

            {/* Texto / Conteúdo */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Conteúdo *</label>
              <textarea 
                rows={8}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva o texto completo da publicação aqui..." 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all resize-y"
                required
              />
            </div>

            {/* Imagens (Upload UI Simples) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Imagens (Opcional)</label>
              <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} className="text-[var(--color-brand-blue-light)]" />
                </div>
                <p className="text-sm font-medium text-slate-700">Clique para fazer upload ou arraste os arquivos</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG ou WEBP (Max. 5MB por imagem)</p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 pt-6 border-t border-slate-100">
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, "rascunho")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm"
              >
                <Save size={18} /> Salvar Rascunho
              </button>
              
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, "pendente")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-brand-green)] text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm"
              >
                <Send size={18} /> Enviar para Aprovação
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
