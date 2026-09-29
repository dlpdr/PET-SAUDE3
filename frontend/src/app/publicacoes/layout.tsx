import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acervo de Publicações | PET Saúde',
  description: 'Ações comunitárias, cartilhas educativas e artigos do PET Saúde UNIVASF/Afrânio.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
