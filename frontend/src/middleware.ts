import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  
  const path = request.nextUrl.pathname;

  // Se não estiver logado e tentar acessar qualquer coisa em /dashboard, joga pro login
  if (!token && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se for admin, mas tentar acessar a página do monitor
  if (token && role === 'admin' && path.startsWith('/dashboard/monitor')) {
    return NextResponse.redirect(new URL('/dashboard/admin', request.url));
  }

  // Se for monitor (ou visitante registrado), mas tentar acessar o admin
  if (token && role !== 'admin' && path.startsWith('/dashboard/admin')) {
    return NextResponse.redirect(new URL('/dashboard/monitor', request.url));
  }

  // Se já estiver logado e tentar acessar a tela de login ou registro
  if (token && (path === '/login' || path === '/register')) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard/monitor', request.url));
  }

  return NextResponse.next();
}

// Configura em quais rotas esse middleware vai rodar
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
