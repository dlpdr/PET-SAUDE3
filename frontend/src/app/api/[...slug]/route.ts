import { NextRequest } from 'next/server';
import { backendUrl } from '@/lib/backend';

async function handleRequest(req: NextRequest, props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params;
  if (params.slug.some(part => part === '.' || part === '..' || /[/\\]/.test(part))) {
    return Response.json({ detail: 'Caminho inválido.' }, { status: 400 });
  }
  const slug = params.slug.map(encodeURIComponent).join('/');
  
  // Get query params
  const searchParams = req.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  
  const headers = new Headers();
  for (const name of ['authorization', 'content-type', 'accept']) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    const targetUrl = new URL(`${slug}/${queryString}`, backendUrl());
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('set-cookie');
    responseHeaders.set('cache-control', 'no-store');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response(JSON.stringify({ detail: 'Proxy Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Next.js requires exporting supported methods explicitly
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
