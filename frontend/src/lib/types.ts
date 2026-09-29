export interface PublicationImage {
  id: number;
  imagem: string;
  descricao_acessivel: string;
  autorizacao_confirmada?: boolean;
}

export interface PublicationAuthor {
  id?: number;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface PublicationSummary {
  id: number;
  titulo: string;
  texto: string;
  categoria: string;
  data_publicacao: string | null;
  criado_em?: string;
  imagem_capa?: string | null;
  imagens: PublicationImage[];
}

export interface PublicationDetail extends PublicationSummary {
  status: string;
  data_atividade: string | null;
  motivo_rejeicao?: string | null;
  autor?: PublicationAuthor | null;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export interface PublicationComment {
  id: number;
  autor?: PublicationAuthor | null;
  texto: string;
  criado_em: string;
  ativo?: boolean;
}

export interface PaginatedResponse<T> { count: number; next: string | null; previous: string | null; results: T[]; }
