import { backendUrl } from '@/lib/backend';

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.some(part => part === '.' || part === '..' || /[/\\]/.test(part))) {
    return new Response(null, { status: 400 });
  }
  try {
    const url = new URL(`/media/${path.map(encodeURIComponent).join('/')}`, backendUrl());
    const response = await fetch(url, { redirect: 'error', cache: 'no-store' });
    if (!response.ok) return new Response(null, { status: response.status });
    const contentType = response.headers.get('content-type') || '';
    if (!/^image\/(jpeg|png|gif|webp|avif|bmp)(;|$)/i.test(contentType)) {
      return new Response(null, { status: 415 });
    }
    return new Response(response.body, { headers: {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=300',
    } });
  } catch {
    return new Response(null, { status: 502 });
  }
}
