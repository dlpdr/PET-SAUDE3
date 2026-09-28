"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, PlusCircle, LogOut, CheckSquare, Users, Library, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/dashboard/admin");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(Cookies.get("user_role") || null);
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_role");
    window.location.href = "/";
  };

  const monitorNavItems = [
    { name: "Visão Geral", href: "/dashboard/monitor", icon: LayoutDashboard },
    { name: "Nova Publicação", href: "/dashboard/monitor/nova-publicacao", icon: PlusCircle },
  ];

  const adminNavItems = [
    { name: "Fila de Aprovação", href: "/dashboard/admin", icon: CheckSquare },
    { name: "Gerenciar Monitores", href: "/dashboard/admin/monitores", icon: Users },
    { name: "Acervo Completo", href: "/publicacoes", icon: Library },
  ];

  const navItems = isAdmin ? adminNavItems : monitorNavItems;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <Link href="/" className="h-10 w-24 relative cursor-pointer">
            <Image src="/logos/petsaude.png" alt="PET Saúde" fill className="object-contain object-left" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {isAdmin ? "Menu do Admin" : "Menu do Monitor"}
          </p>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.includes('/revisar') && item.href === '/dashboard/admin');
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-[var(--color-brand-blue-dark)] text-white shadow-md" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}

          <div className="my-4 border-t border-slate-100" />
          
          <Link 
            href="/publicacoes"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
            target="_blank"
          >
            <ExternalLink size={18} />
            <span className="font-medium text-sm">Ver Site Público</span>
          </Link>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-bold text-slate-800">
            {isAdmin ? "Painel de Administração" : "Painel do Monitor"}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{isAdmin ? "Admin Oficial" : "Sua Conta"}</p>
              <p className="text-xs text-slate-500">{isAdmin ? "Coordenador" : "Monitor"}</p>
            </div>
            <div className={`h-10 w-10 rounded-full text-white flex items-center justify-center font-bold shadow-sm ${isAdmin ? "bg-slate-800" : "bg-gradient-to-tr from-[var(--color-brand-blue-light)] to-[var(--color-brand-orange)]"}`}>
              {isAdmin ? "AD" : "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           {/* Fundo sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-blue-light)] opacity-5 blur-[100px] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
