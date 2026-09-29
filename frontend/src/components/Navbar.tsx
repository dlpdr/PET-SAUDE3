"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut, LayoutDashboard } from "lucide-react";

function subscribe(onChange: () => void) {
  window.addEventListener('focus', onChange);
  window.addEventListener('auth-change', onChange);
  return () => {
    window.removeEventListener('focus', onChange);
    window.removeEventListener('auth-change', onChange);
  };
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  usePathname();
  const router = useRouter();
  const role = useSyncExternalStore(subscribe, () => Cookies.get('access_token') ? Cookies.get('user_role') || null : null, () => null);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_role");
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
    router.refresh();
  };

  const getDashboardLink = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "monitor") return "/dashboard/monitor";
    return "/publicacoes"; // visitante
  };

  return (
    <nav aria-label="Navegação principal" className="max-w-6xl mx-auto glass rounded-2xl px-4 py-3 flex flex-wrap gap-3 items-center justify-between transition-all duration-300 print:hidden">
      <div className="flex items-center gap-4">
        <Link href="/" className="h-8 w-24 relative block cursor-pointer">
          <Image src="/logos/petsaude.png" alt="PET Saúde Logo" fill className="object-contain object-left" />
        </Link>
      </div>
      
      <button type="button" aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen(value => !value)} className="rounded-lg border px-3 py-2 text-sm md:hidden">{menuOpen ? 'Fechar menu' : 'Menu'}</button>
      <div id="public-navigation" onClick={() => setMenuOpen(false)} className={`${menuOpen ? 'flex' : 'hidden'} order-last w-full flex-wrap md:order-none md:w-auto md:flex items-center gap-4 text-sm font-medium text-[var(--color-brand-blue-dark)]`}>
        <Link href="/" className="hover:text-[var(--color-brand-orange)] transition-colors">Início</Link>
        <Link href="/#acervo" className="hover:text-[var(--color-brand-orange)] transition-colors">Acervo</Link>
        <Link href="/#sobre" className="hover:text-[var(--color-brand-orange)] transition-colors">Sobre</Link>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {role ? (
          <>
            <Link 
              href={getDashboardLink()} 
              className="flex items-center gap-2 text-sm font-medium bg-slate-100 text-[var(--color-brand-blue-dark)] px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              <LayoutDashboard size={16} /> Painel
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors bg-white/50 px-4 py-2 rounded-full hover:bg-red-50"
            >
              Sair <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-[var(--color-brand-blue-dark)] hover:text-[var(--color-brand-orange)] transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="text-sm font-medium bg-[var(--color-brand-blue-dark)] text-white px-5 py-2 rounded-full hover:bg-[var(--color-brand-blue-light)] transition-colors shadow-md hover:shadow-lg">
              Cadastrar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
