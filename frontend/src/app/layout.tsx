import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PET Saúde | Informação e Saúde Digital",
  description: "Plataforma do PET Saúde para gestão de publicações e atividades.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 relative`}>
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-brand-blue-light)] opacity-20 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-[var(--color-brand-orange)] opacity-10 blur-[100px] -z-10 pointer-events-none" />

        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <nav className="max-w-6xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 relative">
                <Image src="/logos/petsaude.png" alt="PET Saúde Logo" fill className="object-contain object-left" />
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-brand-blue-dark)]">
              <a href="#sobre" className="hover:text-[var(--color-brand-orange)] transition-colors">Sobre</a>
              <a href="#atividades" className="hover:text-[var(--color-brand-orange)] transition-colors">Atividades</a>
              <a href="#parceiros" className="hover:text-[var(--color-brand-orange)] transition-colors">Parceiros</a>
            </div>

            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm font-medium text-[var(--color-brand-blue-dark)] hover:text-[var(--color-brand-orange)] transition-colors">
                Entrar
              </a>
              <a href="/register" className="text-sm font-medium bg-[var(--color-brand-blue-dark)] text-white px-5 py-2 rounded-full hover:bg-[var(--color-brand-blue-light)] transition-colors shadow-md hover:shadow-lg">
                Cadastrar
              </a>
            </div>
          </nav>
        </header>

        <main className="flex-grow pt-28">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-100 mt-20 py-12">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg text-[var(--color-brand-blue-dark)]">PET Saúde</h3>
              <p className="text-sm text-slate-500">Informação e Saúde Digital transformando a realidade acadêmica e comunitária.</p>
            </div>
            
            <div className="flex justify-center gap-8">
              <div className="h-12 w-24 relative opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <Image src="/logos/univasf.png" alt="UNIVASF" fill className="object-contain" />
              </div>
              <div className="h-12 w-24 relative opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <Image src="/logos/afranio.png" alt="Prefeitura de Afrânio" fill className="object-contain" />
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <p>© {new Date().getFullYear()} PET Saúde.</p>
              <p>Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
