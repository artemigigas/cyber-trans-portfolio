'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Baby, 
  Activity, 
  FileText, 
  HeartPulse, 
  Building2, 
  ArrowLeft, 
  ExternalLink,
  Sliders,
  Terminal
} from 'lucide-react';

// Módulos disponíveis baseados no seu script PySUS
const modulosBase = [
  {
    id: 'sinasc',
    nome: 'SINASC',
    descricao: 'Sistema de Informações sobre Nascidos Vivos. Indicadores de pré-natal, mortalidade materna e marcadores por raça/cor.',
    icone: Baby,
    cor: 'text-cyber-pink',
    borderCor: 'border-cyber-pink/40',
    hoverCor: 'hover:border-cyber-pink',
    bgBadge: 'bg-cyber-pink/10',
    frequencia: 'Anual',
    destaque: 'Filtros socioepidemiológicos e saúde da população negra'
  },
  {
    id: 'sim',
    nome: 'SIM',
    descricao: 'Sistema de Informações sobre Mortalidade. Dados consolidados de causas básicas de óbitos e perfis demográficos.',
    icone: HeartPulse,
    cor: 'text-cyber-blue',
    borderCor: 'border-cyber-blue/40',
    hoverCor: 'hover:border-cyber-blue',
    bgBadge: 'bg-cyber-blue/10',
    frequencia: 'Anual',
    destaque: 'Mortalidade materna e geral'
  },
  {
    id: 'sih',
    nome: 'SIH',
    descricao: 'Sistema de Informações Hospitalares. Registros de internações (AIH), procedimentos e custos na rede do SUS.',
    icone: Activity,
    cor: 'text-cyber-green',
    borderCor: 'border-cyber-green/40',
    hoverCor: 'hover:border-cyber-green',
    bgBadge: 'bg-cyber-green/10',
    frequencia: 'Mensal',
    destaque: 'Internações e diagnósticos hospitalares'
  },
  {
    id: 'sia',
    nome: 'SIA',
    descricao: 'Sistema de Informações Ambulatórias. Produção ambulatorial, consultas, exames e atendimento de alta complexidade.',
    icone: FileText,
    cor: 'text-yellow-400',
    borderCor: 'border-yellow-400/40',
    hoverCor: 'hover:border-yellow-400',
    bgBadge: 'bg-yellow-400/10',
    frequencia: 'Mensal',
    destaque: 'Procedimentos e consultas públicas'
  },
  {
    id: 'cnes',
    nome: 'CNES',
    descricao: 'Cadastro Nacional de Estabelecimentos de Saúde. Mapeamento de postos, hospitais, leitos e equipes ativas.',
    icone: Building2,
    cor: 'text-purple-400',
    borderCor: 'border-purple-400/40',
    hoverCor: 'hover:border-purple-400',
    bgBadge: 'bg-purple-400/10',
    frequencia: 'Mensal',
    destaque: 'Infraestrutura da rede pública'
  }
];

export default function ConsultaMinisterio() {
  const [moduloSelecionado, setModuloSelecionado] = useState<string | null>(null);


  
  const URL_APP_PYTHON = "https://transita.streamlit.app/";

  return (
    <main className="min-h-screen bg-cyber-dark text-cyber-white font-mono p-4 md:p-8 selection:bg-cyber-pink selection:text-black">
      <div className="max-w-6xl mx-auto border border-cyber-pink/30 bg-black/90 p-6 md:p-10 rounded-lg shadow-[0_0_25px_rgba(255,0,127,0.15)] relative">
        
        {/* NAVEGAÇÃO DE VOLTA */}
        <div className="flex justify-between items-center border-b border-cyber-pink/30 pb-4 mb-8 text-xs">
          <Link href="/" className="text-cyber-blue hover:text-cyber-pink flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> [RETORNAR AO TERMINAL PRINCIPAL]
          </Link>
          <span className="text-cyber-green hidden sm:inline">&lt;TRANSITA // DATASUS ENGINE&gt;</span>
        </div>

        {/* TÍTULO DA SEÇÃO */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue px-3 py-1 text-xs mb-3 rounded">
            <Database size={14} /> PAINEL INTERATIVO SEM CÓDIGO
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-cyber-white tracking-tight">
            CONSULTA DIRETA ÀS BASES DO DATASUS
          </h1>
          <p className="text-gray-300 text-sm mt-2 max-w-2xl leading-relaxed">
            Selecione o módulo de dados desejado para realizar extrações, filtrar quadrimestres, estratificar por raça/cor ou município sem precisar de conhecimento em Python ou R.
          </p>
        </div>

        {/* GRID DE MÓDULOS DE BASES DE DADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {modulosBase.map((modulo) => {
            const Icone = modulo.icone;
            const isSelected = moduloSelecionado === modulo.id;

            return (
              <div
                key={modulo.id}
                onClick={() => setModuloSelecionado(modulo.id)}
                className={`cursor-pointer border ${modulo.borderCor} ${modulo.hoverCor} bg-black/60 p-5 rounded-lg transition-all relative group ${
                  isSelected ? 'ring-2 ring-cyber-pink bg-black' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs ${modulo.cor} ${modulo.bgBadge} border border-current px-2 py-0.5 rounded flex items-center gap-1 font-bold`}>
                    <Icone size={14} /> MÓDULO: {modulo.nome}
                  </span>
                  <span className="text-[10px] text-gray-400 border border-gray-800 px-1.5 py-0.5 rounded">
                    {modulo.frequencia}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-cyber-white group-hover:text-cyber-pink transition-colors">
                  Base {modulo.nome}
                </h3>
                <p className="text-xs text-gray-400 mt-2 mb-4 leading-relaxed min-h-[48px]">
                  {modulo.descricao}
                </p>

                <div className="border-t border-gray-800 pt-3 flex justify-between items-center text-xs">
                  <span className="text-gray-500 text-[11px] truncate max-w-[180px]">
                    {modulo.destaque}
                  </span>
                  <button className={`text-xs font-bold ${modulo.cor} flex items-center gap-1 group-hover:underline`}>
                    {isSelected ? 'SELECIONADO' : 'CARREGAR'} &gt;
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ÁREA DE EXECUÇÃO DO SCRIPT (MODAL INTERATIVO / IFRAME) */}
        {moduloSelecionado && (
          <div className="border-2 border-cyber-green bg-black p-6 rounded-lg shadow-[0_0_20px_rgba(0,255,102,0.2)] animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyber-green/40 pb-4 mb-6 gap-4">
              <div>
                <span className="text-xs text-cyber-green flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyber-green animate-ping"></span>
                  SISTEMA CARREGADO: {moduloSelecionado.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold text-cyber-white mt-1">
                  Painel de Filtros & Estratificação
                </h2>
              </div>

              <div className="flex gap-3">
                <a
                  href={`${URL_APP_PYTHON}?base=${moduloSelecionado}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-cyber-green text-black font-bold px-4 py-2 rounded text-xs flex items-center gap-2 hover:bg-cyber-green/80 transition-all shadow-[0_0_10px_#00ff66]"
                >
                  Abrir em Tela Cheia <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* EMBED DO SCRIPT STREAMLIT COM O MÓDULO SELECIONADO */}
            <div className="relative w-full h-[650px] rounded border border-cyber-green/30 overflow-hidden bg-black">
              <iframe
                src={`${URL_APP_PYTHON}/?embedded=true&base=${moduloSelecionado}`}
                className="w-full h-full border-0"
                 title={`Módulo DATASUS - ${moduloSelecionado}`}
                    />
            </div>
            
            <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
              <Terminal size={12} className="text-cyber-green" /> 
              O script Python está processando diretamente via PySUS e tratando microdados em tempo real.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}