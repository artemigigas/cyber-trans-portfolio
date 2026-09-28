'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, ArrowLeft, Shield } from 'lucide-react';

// Importação dinâmica sem SSR para evitar erros de servidor no Leaflet
const QuilombosMap = dynamic(() => import('../components/QuilombosMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-black/80 border border-cyber-green/30 rounded-lg flex items-center justify-center text-cyber-green text-sm font-mono animate-pulse">
      &gt; CARREGANDO_MALHA_GEOGRAFICA_POA_IBGE...
    </div>
  )
});

export default function QuilombosPage() {
  return (
    <main className="min-h-screen bg-cyber-dark text-cyber-white font-mono p-4 md:p-8 selection:bg-cyber-pink selection:text-black">
      <div className="max-w-6xl mx-auto border border-cyber-green/30 bg-black/80 p-6 md:p-10 rounded-lg shadow-[0_0_25px_rgba(0,255,102,0.15)] relative overflow-hidden">
        
        {/* Navegação Topo */}
        <div className="flex justify-between items-center border-b border-cyber-green/30 pb-4 mb-8 text-xs">
          <Link href="/" className="text-cyber-green hover:underline flex items-center gap-1">
            <ArrowLeft size={14} /> &lt; VOLTAR_PARA_PAINEL
          </Link>
          <span className="text-gray-400">&lt;GEO_VIGILANCIA // PORTO_ALEGRE&gt;</span>
        </div>

        {/* Cabeçalho */}
        <header className="mb-8">
          <div className="inline-block bg-cyber-green/10 border border-cyber-green text-cyber-green px-3 py-1 text-xs mb-3 rounded">
            EQUITATE &amp; SAÚDE COLETIVA
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-cyber-white mb-3">
            QUILOMBOS URBANOS &amp; <span className="text-cyber-green">ATENÇÃO PRIMÁRIA</span>
          </h1>
          <p className="text-gray-300 text-sm max-w-3xl leading-relaxed">
            Mapeamento geoespacial dos territórios quilombolas de Porto Alegre. Cruza a contagem de população por Setor Censitário (Censo IBGE 2022) com estimativas comunitárias territoriais e a vinculação da Unidade de Saúde (US) de referência do SUS.
          </p>
        </header>

        {/* Componente do Mapa */}
        <section className="mb-8">
          <QuilombosMap />
        </section>

        {/* Legenda e Notas Técnicas */}
        <footer className="bg-black/60 border border-cyber-blue/30 p-4 rounded-lg text-xs text-gray-400 space-y-2">
          <p className="text-cyber-blue font-bold flex items-center gap-1">
            <Shield size={14} /> METODOLOGIA &amp; FONTES DE DADOS:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>IBGE Censo 2022:</strong> Dados do agregado por Setor Censitário de pessoas autodeclaradas quilombolas (Tabela 10089).</li>
            <li><strong>Unidades de Saúde de Referência:</strong> Mapeamento da cobertura territorial e eSF da Atenção Primária em Saúde de Porto Alegre.</li>
          </ul>
        </footer>

      </div>
    </main>
  );
}