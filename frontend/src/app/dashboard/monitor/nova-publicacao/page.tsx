"use client";

import { ArrowLeft, Save, Send, Loader2, CheckCircle2, Plus, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import Cookies from "js-cookie";

export default function NovaPublicacao() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [texto, setTexto] = useState("");
  const [dataAtividade, setDataAtividade] = useState("");
  const [imagemCapa, setImagemCapa] = useState<{ file: File; preview: string } | null>(null);
  const [imagens, setImagens] = useState<{ file: File; descricao: string; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent, status: "rascunho" | "pendente" | "publicado") => {
    e.preventDefault();
    setFeedback(null);

    if (!titulo || !categoria || !texto) {
      setFeedback({ type: 'error', message: "Por favor, preencha todos os campos obrigatórios." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("categoria", categoria === 'acao' ? 'Ação Comunitária' : categoria === 'cartilha' ? 'Cartilha Educativa' : 'Artigo Acadêmico');
      formData.append("texto", texto);
      formData.append("status", status);
      if (dataAtividade) {
        formData.append("data_atividade", dataAtividade);
      }
      if (imagemCapa) {
        formData.append("imagem_capa", imagemCapa.file);
      }

      imagens.forEach((imagem, index) => {
        formData.append("novas_imagens", imagem.file);
        formData.append("descricoes_imagens", imagem.descricao || `Imagem ${index + 1}`);
      });

      await api.post('/publications/manage/', formData, {
        headers: {
          'Content-Type': undefined
        }
      });
      
      setFeedback({ type: 'success', message: "Publicação salva com sucesso! Redirecionando..." });
      
      setTimeout(() => {
        const role = Cookies.get('user_role') === 'admin' ? 'admin' : 'monitor';
        router.push(`/dashboard/${role}`);
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setFeedback({ 
        type: 'error', 
        message: error.response?.data ? JSON.stringify(error.response.data) : error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = typeof document !== 'undefined' && Cookies.get('user_role') === 'admin';

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Link href={`/dashboard/${isAdmin ? 'admin' : 'monitor'}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 w-fit transition-colors">
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
              
              <div className="md:w-1/4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Data da Atividade</label>
                <input 
                  type="date" 
                  value={dataAtividade}
                  onChange={(e) => setDataAtividade(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)] focus:border-transparent transition-all text-slate-700"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Imagem de Capa (Opcional)</label>
              <p className="text-xs text-slate-500 mb-2">Esta imagem ficará em destaque no topo da publicação.</p>
              {imagemCapa ? (
                <div className="flex gap-3 rounded-xl border border-slate-200 p-3 items-center">
                  <Image unoptimized width={96} height={96} src={imagemCapa.preview} alt="Prévia da capa" className="h-24 w-32 rounded-lg object-cover bg-slate-100" />
                  <div className="min-w-0 flex-1 flex flex-col gap-2">
                    <p className="truncate text-xs text-slate-500 font-medium">{imagemCapa.file.name}</p>
                    <p className="text-xs text-[var(--color-brand-blue-light)]">Imagem selecionada para capa</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(imagemCapa.preview);
                      setImagemCapa(null);
                    }}
                    className="self-start rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Clique para enviar a capa</span> ou arraste e solte</p>
                    <p className="text-xs text-slate-500">SVG, PNG, JPG ou GIF (MAX. 800x400px)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setImagemCapa({ file, preview: URL.createObjectURL(file) });
                    }}
                  />
                </label>
              )}
            </div>

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

            {/* Upload de imagens */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Imagens (Opcional, até 5)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imagens.map((imagem, index) => (
                  <div key={`${imagem.file.name}-${index}`} className="flex gap-3 rounded-xl border border-slate-200 p-3">
                    <Image unoptimized width={96} height={96} src={imagem.preview} alt={`Prévia da imagem ${index + 1}`} className="h-24 w-24 rounded-lg object-cover bg-slate-100" />
                    <div className="min-w-0 flex-1 flex flex-col gap-2">
                      <p className="truncate text-xs text-slate-500" title={imagem.file.name}>{imagem.file.name}</p>
                      <label className="text-xs font-semibold text-slate-500" htmlFor={`descricao-imagem-${index}`}>Descrição acessível</label>
                      <input
                        id={`descricao-imagem-${index}`}
                        type="text"
                        value={imagem.descricao}
                        onChange={(e) => setImagens((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, descricao: e.target.value } : item))}
                        placeholder={`Descreva a imagem ${index + 1}`}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(imagem.preview);
                        setImagens((atuais) => atuais.filter((_, itemIndex) => itemIndex !== index));
                      }}
                      aria-label={`Remover imagem ${index + 1}`}
                      className="self-start rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
              {imagens.length < 5 && (
                <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Plus size={18} />
                  {imagens.length ? "Adicionar mais uma imagem" : "Adicionar imagens"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const selecionadas = Array.from(e.target.files || []);
                      const vagas = 5 - imagens.length;
                      const novasImagens = selecionadas.slice(0, vagas).map((file) => ({ file, descricao: "", preview: URL.createObjectURL(file) }));
                      setImagens((atuais) => [...atuais, ...novasImagens]);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              )}
              <p className="text-xs text-slate-500">{imagens.length} de 5 imagens selecionadas. Inclua uma descrição para cada imagem.</p>
            </div>

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
                onClick={(e) => handleSubmit(e, isAdmin ? "publicado" : "pendente")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-brand-green)] text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                {isAdmin ? "Publicar Imediatamente" : "Enviar para Aprovação"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
