import { NextRequest } from 'next/server';

const BACKEND_URL = 'http://18.117.173.196/api';

export async function ANY(req: NextRequest, props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params;
  const slug = params.slug.join('/');
  
  // Get query params
  const searchParams = req.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  const targetUrl = `${BACKEND_URL}/${slug}/${queryString}`;
  
  const headers = new Headers(req.headers);
  headers.delete('host'); // Let fetch set the host
  headers.delete('referer');

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');

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
export const GET = ANY;
export const POST = ANY;
export const PUT = ANY;
export const PATCH = ANY;
export const DELETE = ANY;
