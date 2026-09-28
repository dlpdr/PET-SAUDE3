"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userRole = Cookies.get("user_role");
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_role");
    setRole(null);
    window.location.href = "/"; // redirect to home
  };

  const getDashboardLink = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "monitor") return "/dashboard/monitor";
    return "/publicacoes"; // visitante
  };

  return (
    <nav className="max-w-6xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        <Link href="/" className="h-8 w-24 relative block cursor-pointer">
          <Image src="/logos/petsaude.png" alt="PET Saúde Logo" fill className="object-contain object-left" />
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-brand-blue-dark)]">
        <Link href="/" className="hover:text-[var(--color-brand-orange)] transition-colors">Início</Link>
        <Link href="/#sobre" className="hover:text-[var(--color-brand-orange)] transition-colors">Sobre</Link>
        <Link href="/publicacoes" className="hover:text-[var(--color-brand-orange)] transition-colors">Atividades</Link>
        <Link href="/#parceiros" className="hover:text-[var(--color-brand-orange)] transition-colors">Parceiros</Link>
      </div>

      <div className="flex items-center gap-4">
        {role ? (
          <>
            <Link 
              href={getDashboardLink()} 
              className="flex items-center gap-2 text-sm font-medium bg-slate-100 text-[var(--color-brand-blue-dark)] px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              <LayoutDashboard size={16} /> Painel
            </Link>
            <Link 
              href="/perfil" 
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[var(--color-brand-blue-dark)] transition-colors px-2 py-2"
            >
              Perfil
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
