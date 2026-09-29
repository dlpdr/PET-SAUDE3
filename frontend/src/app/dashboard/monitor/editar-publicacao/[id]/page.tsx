"use client";

import { ArrowLeft, UploadCloud, Save, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import api, { getApiErrorMessage, getMediaUrl } from "@/lib/api";
import Image from "next/image";
import type { PublicationImage } from "@/lib/types";

export default function EditarPublicacao() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [texto, setTexto] = useState("");
  const [dataAtividade, setDataAtividade] = useState("");
  const [imagens, setImagens] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<PublicationImage[]>([]);
  const [descricoesImagens, setDescricoesImagens] = useState<string[]>([]);
  const [statusAtual, setStatusAtual] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/publications/manage/${id}/`);
        const post = res.data;
        setExistingImages(post.imagens || []);
        setTitulo(post.titulo);
        const catMap: Record<string, string> = {
          'Ação Comunitária': 'acao',
          'Cartilha Educativa': 'cartilha',
          'Artigo Acadêmico': 'artigo'
        };
        setCategoria(catMap[post.categoria] || "");
        setTexto(post.texto);
        setStatusAtual(post.status);
        setMotivoRejeicao(post.motivo_rejeicao || "");
        if (post.data_atividade) {
          setDataAtividade(post.data_atividade);
        }
      } catch (err: unknown) {
        console.error(err);
        setFeedback({ type: 'error', message: "Erro ao carregar a publicação. Verifique se ela existe e se você tem permissão." });
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent, novoStatus: "rascunho" | "pendente") => {
    e.preventDefault();
    setFeedback(null);

    if (existingImages.length + imagens.length > 5) {
      setFeedback({ type: 'error', message: 'O limite é de cinco imagens, incluindo as já anexadas.' });
      return;
    }

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
      formData.append("status", novoStatus);
      formData.append("data_atividade", dataAtividade);

      imagens.forEach((img, index) => {
        formData.append("novas_imagens", img);
        formData.append("descricoes_imagens", descricoesImagens[index] || "Imagem anexada");
      });

      await api.patch(`/publications/manage/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFeedback({ type: 'success', message: "Publicação atualizada com sucesso! Redirecionando..." });
      
      setTimeout(() => {
        router.push('/dashboard/monitor');
      }, 1500);

    } catch (error: unknown) {
      console.error(error);
      setFeedback({ 
        type: 'error', 
        message: getApiErrorMessage(error, "Erro ao atualizar a publicação. Verifique os dados e tente novamente.")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Link href="/dashboard/monitor" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 w-fit transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Voltar para o Painel</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {existingImages.length > 0 && <div className="p-6 grid grid-cols-2 gap-4">
          {existingImages.map(image => {
            const src = getMediaUrl(image.imagem);
            return src ? <figure key={image.id}><Image unoptimized src={src} width={400} height={240} alt={image.descricao_acessivel} className="h-40 w-full rounded-xl object-cover" /><figcaption className="mt-2 text-sm text-slate-500">{image.descricao_acessivel}</figcaption></figure> : null;
          })}
        </div>}
        <div className="p-6 md:p-8 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Editar Publicação</h2>
          {statusAtual === 'rejeitado' && motivoRejeicao && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Publicação rejeitada pelo Administrador</p>
                <p className="text-red-600 text-sm mt-1">{motivoRejeicao}</p>
                <p className="text-red-500 text-xs mt-2">Corrija os pontos acima e envie para aprovação novamente.</p>
              </div>
            </div>
          )}
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

            {/* Upload de Imagens */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-semibold text-slate-700">Adicionar Novas Imagens (Opcional - Selecione múltiplas segurando Shift ou Ctrl)</label>
              
              <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative min-h-[120px]">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      setImagens(prev => [...prev, ...newFiles]);
                      setDescricoesImagens(prev => [...prev, ...newFiles.map(() => "")]);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                  <UploadCloud size={20} className="text-[var(--color-brand-blue-light)]" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Clique ou arraste para anexar imagens adicionais
                </p>
                <p className="text-xs text-slate-400 mt-1">{imagens.length} novo(s) arquivo(s) selecionado(s)</p>
              </div>
              
              {imagens.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                  <p className="text-sm font-semibold text-slate-700">Descrições Acessíveis (Obrigatório para acessibilidade)</p>
                  {imagens.map((img, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-full md:w-1/3 truncate text-sm font-medium text-slate-600 flex items-center gap-2">
                        <div className="h-8 w-8 bg-slate-200 rounded flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${URL.createObjectURL(img)})` }}></div>
                        <span className="truncate">{img.name}</span>
                      </div>
                      <input 
                        type="text" 
                        value={descricoesImagens[index] || ""}
                        onChange={(e) => {
                          const newDesc = [...descricoesImagens];
                          newDesc[index] = e.target.value;
                          setDescricoesImagens(newDesc);
                        }}
                        placeholder="Descreva esta imagem para leitores de tela..." 
                        className="flex-1 w-full px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-light)]"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setImagens(prev => prev.filter((_, i) => i !== index));
                          setDescricoesImagens(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 hover:text-red-700 p-2 text-sm font-medium"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
