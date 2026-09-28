"use client";

import { ArrowLeft, UploadCloud, Save, Send, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";

export default function NovaPublicacao() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [texto, setTexto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent, status: "rascunho" | "pendente") => {
    e.preventDefault();
    setFeedback(null);

    if (!titulo || !categoria || !texto) {
      setFeedback({ type: 'error', message: "Por favor, preencha todos os campos obrigatórios." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/publications/', {
        titulo,
        categoria: categoria === 'acao' ? 'Ação Comunitária' : categoria === 'cartilha' ? 'Cartilha Educativa' : 'Artigo Acadêmico',
        texto,
        status
      });
      
      setFeedback({ type: 'success', message: "Publicação salva com sucesso! Redirecionando..." });
      
      // Espera 1.5s para o usuário ler a mensagem antes de voltar
      setTimeout(() => {
        router.push('/dashboard/monitor');
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setFeedback({ 
        type: 'error', 
        message: error.response?.data?.detail || "Erro ao salvar a publicação. Verifique os dados e tente novamente." 
      });
    } finally {
      setIsSubmitting(false);
    }
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
          
          {feedback && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {feedback.type === 'success' && <CheckCircle2 size={20} />}
              <span className="font-medium text-sm">{feedback.message}</span>
            </div>
          )}

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

            {/* Imagens */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Imagens (Opcional)</label>
              <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} className="text-[var(--color-brand-blue-light)]" />
                </div>
                <p className="text-sm font-medium text-slate-700">Clique para fazer upload ou arraste os arquivos</p>
                <p className="text-xs text-slate-500 mt-1">Recurso visual bloqueado nesta fase do MVP</p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 pt-6 border-t border-slate-100">
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, "rascunho")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                Salvar Rascunho
              </button>
              
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, "pendente")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-brand-green)] text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                Enviar para Aprovação
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
