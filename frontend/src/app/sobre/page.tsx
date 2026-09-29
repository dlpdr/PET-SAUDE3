import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre o PET Saúde | PET Saúde',
  description: 'Conheça o portal de publicações do PET Saúde da UNIVASF em parceria com a Prefeitura de Afrânio.',
};

export default function Sobre() {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return <article className="mx-auto max-w-4xl px-6 py-12 text-slate-700">
    <p className="mb-4 font-semibold text-blue-700">UNIVASF • Afrânio</p>
    <h1 className="mb-8 text-4xl font-bold text-slate-900">Sobre o PET Saúde</h1>
    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-8 leading-relaxed shadow-sm">
      <p>O Programa de Educação pelo Trabalho para a Saúde aproxima a formação acadêmica, os serviços de saúde e a comunidade. Este portal reúne publicações e atividades do PET Saúde, em parceria entre a Universidade Federal do Vale do São Francisco (UNIVASF) e a Prefeitura de Afrânio.</p>
      <h2 className="text-2xl font-bold text-slate-900">Conhecimento para a comunidade</h2>
      <p>O portal tem como objetivo compartilhar ações comunitárias, cartilhas educativas e artigos acadêmicos. É um espaço para estudantes, profissionais de saúde e moradores acompanharem as atividades e acessarem os materiais produzidos pelo projeto.</p>
      <Link href="/publicacoes" className="inline-block rounded-xl bg-[var(--color-brand-blue-dark)] px-6 py-3 text-white">Conhecer as publicações</Link>
      <h2 className="text-2xl font-bold text-slate-900">Contato e instituições parceiras</h2>
      {contact && <p><a className="text-blue-700 underline" href={`mailto:${contact}`}>{contact}</a></p>}
      <p>Consulte os canais institucionais da <a className="text-blue-700 underline" href="https://portais.univasf.edu.br/">UNIVASF</a> e da <a className="text-blue-700 underline" href="https://afranio.pe.gov.br/">Prefeitura de Afrânio</a>.</p>
    </div>
  </article>;
}
