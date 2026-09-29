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
    <nav aria-label="Navegação principal" className="max-w-6xl mx-auto glass rounded-2xl px-6 py-4 flex flex-wrap gap-4 items-center justify-between transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] print:hidden">
      <div className="flex items-center gap-4">
        <Link href="/" className="h-8 w-28 relative block cursor-pointer hover:opacity-80 transition-opacity">
          <Image src="/logos/petsaude.png" alt="PET Saúde Logo" fill className="object-contain object-left" />
        </Link>
      </div>
      
      <button type="button" aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen(value => !value)} className="rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm text-[var(--color-brand-blue-dark)] font-medium hover:bg-slate-100 transition-colors md:hidden">{menuOpen ? 'Fechar menu' : 'Menu'}</button>
      <div id="public-navigation" onClick={() => setMenuOpen(false)} className={`${menuOpen ? 'flex' : 'hidden'} order-last w-full flex-col md:flex-row md:order-none md:w-auto md:flex items-center gap-2 md:gap-8 text-sm font-semibold text-[var(--color-brand-blue-dark)] bg-white/50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none border-slate-100`}>
        <Link href="/" className="w-full md:w-auto text-center hover:text-[var(--color-brand-orange)] hover:scale-105 active:scale-95 transition-all py-2 md:py-0">Início</Link>
        <Link href="/#acervo" className="w-full md:w-auto text-center hover:text-[var(--color-brand-orange)] hover:scale-105 active:scale-95 transition-all py-2 md:py-0">Acervo</Link>
        <Link href="/#sobre" className="w-full md:w-auto text-center hover:text-[var(--color-brand-orange)] hover:scale-105 active:scale-95 transition-all py-2 md:py-0">Sobre</Link>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {role ? (
          <>
            <Link 
              href={getDashboardLink()} 
              className="flex items-center gap-2 text-sm font-semibold bg-white text-[var(--color-brand-blue-dark)] px-5 py-2.5 rounded-full hover:bg-[var(--color-brand-blue-dark)] hover:text-white border border-slate-200 hover:border-transparent transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <LayoutDashboard size={16} /> Painel
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-white transition-all bg-white hover:bg-red-500 px-5 py-2.5 rounded-full border border-red-100 hover:border-transparent shadow-sm hover:shadow-md active:scale-95"
            >
              Sair <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-semibold text-[var(--color-brand-blue-dark)] hover:text-[var(--color-brand-orange)] transition-colors px-4 py-2 rounded-full hover:bg-slate-50">
              Entrar
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-gradient-to-r from-[var(--color-brand-blue-dark)] to-[var(--color-brand-blue-light)] text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-[var(--color-brand-blue-light)]/30 hover:-translate-y-0.5 active:scale-95 transition-all">
              Cadastrar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
