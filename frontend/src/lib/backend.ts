/** Server-side configuration shared by the API and media proxies. */
export function backendUrl(): URL {
  const configured = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!configured && process.env.NODE_ENV === 'production') {
    throw new Error('Configure BACKEND_API_URL no servidor do frontend.');
  }
  const url = new URL(configured || 'http://127.0.0.1:8000/api/');
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid backend protocol');
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return url;
}
