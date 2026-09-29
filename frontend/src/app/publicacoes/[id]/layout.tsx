import type { Metadata } from 'next';
import { backendUrl } from '@/lib/backend';
import type { PublicationDetail } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    // Never send credentials: private drafts must not appear in metadata.
    const response = await fetch(new URL(`publications/${encodeURIComponent(id)}/`, backendUrl()), { cache: 'no-store' });
    if (!response.ok) return { title: 'Publicação | PET Saúde', robots: { index: false, follow: false } };
    const post: PublicationDetail = await response.json();
    if (post.status !== 'publicado') return { robots: { index: false, follow: false } };
    const title = `${post.titulo} | PET Saúde`;
    const description = post.texto.replace(/<[^>]*>/g, '').slice(0, 160);
    const image = post.imagens?.[0]?.imagem;
    const site = process.env.SITE_URL;
    const imageUrl = image ? new URL(image, backendUrl()) : null;
    const sharedImage = imageUrl && site && imageUrl.pathname.startsWith('/media/') ? new URL(imageUrl.pathname, site).href : imageUrl?.href;
    return { title, description, openGraph: { title, description, type: 'article', ...(sharedImage ? { images: [sharedImage] } : {}) } };
  } catch {
    return { title: 'Publicação | PET Saúde' };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
