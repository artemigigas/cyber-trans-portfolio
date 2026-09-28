'use client'; // Necessário no Next.js App Router para rodar useState/useEffect

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Database, FileText, CheckCircle2, 
  AlertCircle, RefreshCw, BarChart3, ArrowUpRight, BookOpen
} from 'lucide-react';

// Aponta para o serviço dentro de app/services/ (ou use a alias @/app/services/camaraService)
import { buscarProposicoesCamaraAPI } from '@/app/services/camaraService';
import ModalNotaTCR from './ModalNotaTCR';
// Dados Iniciais do Estudo (Mock Local de Fallback/Demonstração)
const DADOS_LOCAIS = [
  {
    id: 1,
    tipo: 'PL',
    numero: 2432,
    ano: 2023,
    ementa: 'Garante o atendimento humanizado e a inclusão do nome social de pessoas trans nos registros de saúde do Sistema Único de Saúde (SUS).',
    postura: { tipo: 'GARANTIDORA', label: 'Garantidora / Propositiva', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    url: 'https://www.camara.leg.br'
  },
  {
    id: 2,
    tipo: 'PL',
    numero: 1045,
    ano: 2024,
    ementa: 'Dispõe sobre a vedação do uso de verbas públicas da saúde para procedimentos de redesignação sexual em menores de idade.',
    postura: { tipo: 'RESTRITIVA', label: 'Restritiva / Reativa', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    url: 'https://www.camara.leg.br'
  },
  {
    id: 3,
    tipo: 'RIC',
    numero: 512,
    ano: 2023,
    ementa: 'Requer informações ao Ministério da Saúde sobre as filas de espera para o Processo Transexualizador no SUS nos estados do Sul.',
    postura: { tipo: 'NEUTRA', label: 'Geral / Processual', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    url: 'https://www.camara.leg.br'
  }
];

export default function PainelCamara() {
  const [proposicoes, setProposicoes] = useState(DADOS_LOCAIS);
  const [totalBruto, setTotalBruto] = useState(148);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroPostura, setFiltroPostura] = useState('TODAS');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [fonteViva, setFonteViva] = useState(false);

  // Carregar dados da API oficial
  const carregarDadosAPI = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await buscarProposicoesCamaraAPI();
      setProposicoes(resultado.validados);
      setTotalBruto(resultado.totalBruto);
      setFonteViva(true);
    } catch (e) {
      console.error(e);
      setErro('Não foi possível conectar à API da Câmara no momento. Exibindo dados locais.');
    } finally {
      setCarregando(false);
    }
  };

  // Filtragem combinada (Busca + Tag)
  const proposicoesFiltradas = proposicoes.filter(p => {
    const atendeTexto = p.ementa.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         `${p.tipo} ${p.numero}/${p.ano}`.toLowerCase().includes(termoBusca.toLowerCase());
    const atendeFiltro = filtroPostura === 'TODAS' || p.postura.tipo === filtroPostura;
    return atendeTexto && atendeFiltro;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Topo / Título do Projeto */}
        <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-violet-400 mb-1">
              <Database className="w-4 h-4" />
              <span>LABORATÓRIO DE DADOS & SAÚDE COLETIVA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Observatório Legislativo: População Trans & (C)Sistema
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Análise mista (Quanti-Quali) das proposições na Câmara dos Deputados articulada com as travessias e barreiras no SUS.
            </p>
          </div>

          <button
            onClick={carregarDadosAPI}
            disabled={carregando}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 text-white text-xs font-semibold rounded-xl shadow-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
            {carregando ? 'Consumindo API...' : 'Buscar Dados da API Viva'}
          </button>
        </div>

        {/* Banner Indicador de Fonte de Dados */}
        {erro && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Cards Metricos (Quanti) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-zinc-900 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">
              Volume Bruto (API/Busca)
            </span>
            <div className="text-3xl font-black text-white">{totalBruto}</div>
            <span className="text-[11px] text-zinc-500 mt-2 block">
              Termos brutos sem filtro discursivo
            </span>
          </div>

          <div className="p-5 bg-zinc-900 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-medium text-violet-400 uppercase tracking-wider block mb-1">
              Relevantes Pós-Limpeza
            </span>
            <div className="text-3xl font-black text-violet-400">{proposicoes.length}</div>
            <span className="text-[11px] text-zinc-500 mt-2 block">
              Proposições filtradas por Regex
            </span>
          </div>

          <div className="p-5 bg-zinc-900 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider block mb-1">
              Fonte Atual
            </span>
            <div className="text-lg font-bold text-white flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${fonteViva ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {fonteViva ? 'API ao Vivo (Câmara)' : 'Amostra de Estudo (Local)'}
            </div>
            <span className="text-[11px] text-zinc-500 mt-2 block">
              {fonteViva ? 'Dados sincronizados via dadosabertos.camara.leg.br' : 'Clique no botão acima para sincronizar com a API'}
            </span>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-4 border border-zinc-800/80 rounded-2xl">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por ementa, PL, ano..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
            {['TODAS', 'GARANTIDORA', 'RESTRITIVA', 'NEUTRA'].map((postura) => (
              <button
                key={postura}
                onClick={() => setFiltroPostura(postura)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  filtroPostura === postura
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {postura}
              </button>
            ))}
          </div>
        </div>

        {/* Lista / Feed de Proposições */}
        <div className="space-y-4">
          {proposicoesFiltradas.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-zinc-500 text-sm">
              Nenhuma proposição encontrada para os filtros aplicados.
            </div>
          ) : (
            proposicoesFiltradas.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white font-mono">
                      {item.tipo} {item.numero}/{item.ano}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${item.postura.color}`}>
                      {item.postura.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-serif">
                    {item.ementa}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setItemSelecionado(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                    Ler Nota Quali (TCR)
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition"
                    title="Ver no Portal da Câmara"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal Quali das Notas do TCR */}
      <ModalNotaTCR 
        item={itemSelecionado} 
        onClose={() => setItemSelecionado(null)} 
      />
    </div>
  );
}