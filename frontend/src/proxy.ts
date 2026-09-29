import { NextResponse, type NextRequest } from 'next/server';

// UI redirects; the backend independently enforces permissions.
export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value || request.cookies.get('refresh_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const path = request.nextUrl.pathname;
  if (!token && (path.startsWith('/dashboard') || path === '/perfil')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (path.startsWith('/dashboard/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  if (path.startsWith('/dashboard/monitor') && !['monitor', 'admin'].includes(role || '')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/perfil'] };
