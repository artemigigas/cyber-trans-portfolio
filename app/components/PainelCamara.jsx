'use client'; // Necessário no Next.js App Router para rodar useState/useEffect

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Database, AlertCircle, 
  RefreshCw, ArrowUpRight, BookOpen, ArrowLeft, Calendar, Info
} from 'lucide-react';

// Aponta para o serviço dentro de app/services/ (ou use a alias @/app/services/camaraService)
import { buscarProposicoesCamaraAPI } from '@/app/services/camaraService';
import ModalNotaTCR from './ModalNotaTCR';

export default function PainelCamara() {
  const [proposicoes, setProposicoes] = useState([]);
  const [totalBruto, setTotalBruto] = useState(0);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroPostura, setFiltroPostura] = useState('TODAS');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [fonteViva, setFonteViva] = useState(false);

  // Carregar dados da API oficial sob demanda
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
      setErro('Não foi possível conectar à API da Câmara no momento. Tente novamente em instantes.');
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

  // Contadores por postura
  const contagemPosturas = {
    TODAS: proposicoes.length,
    GARANTIDORA: proposicoes.filter(p => p.postura.tipo === 'GARANTIDORA').length,
    RESTRITIVA: proposicoes.filter(p => p.postura.tipo === 'RESTRITIVA').length,
    NEUTRA: proposicoes.filter(p => p.postura.tipo === 'NEUTRA').length
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Barra Superior de Navegação */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4 text-violet-400" />
            Voltar ao Menu Principal
          </Link>

          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            API Dados Abertos v2 • Câmara dos Deputados
          </span>
        </div>

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
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-400 text-white text-xs font-semibold rounded-xl shadow-lg transition shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
            {carregando ? 'Consultando API...' : 'Buscar Dados da API Viva'}
          </button>
        </div>

        {/* Disclaimer Inicial (antes de sincronizar) */}
        {!fonteViva && !carregando && (
          <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-300 text-xs flex items-start sm:items-center gap-3">
            <Info className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0 text-sky-400" />
            <span>
              <strong>Base aguardando sincronização:</strong> para garantir o carregamento rápido da página, a extração não inicia automaticamente. Clique em <strong>"Buscar Dados da API Viva"</strong> acima para consultar as proposições em tempo real na Câmara dos Deputados.
            </span>
          </div>
        )}

        {/* Aviso durante varredura da API */}
        {carregando && (
          <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-300 text-xs flex items-center gap-3">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>
              Consultando descritores e varrendo os temas oficiais de Direitos Humanos e Saúde na Câmara. Isso pode levar alguns segundos para respeitar o limite da API...
            </span>
          </div>
        )}

        {/* Banner Indicador de Erro */}
        {erro && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Cards Métricos (Quanti) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-zinc-900 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">
              Volume Bruto (API/Busca)
            </span>
            <div className="text-3xl font-black text-white">{totalBruto}</div>
            <span className="text-[11px] text-zinc-500 mt-2 block">
              Registros coletados antes da filtragem
            </span>
          </div>

          <div className="p-5 bg-zinc-900 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-medium text-violet-400 uppercase tracking-wider block mb-1">
              Relevantes Pós-Limpeza
            </span>
            <div className="text-3xl font-black text-violet-400">{proposicoes.length}</div>
            <span className="text-[11px] text-zinc-500 mt-2 block">
              Proposições validadas para análise
            </span>
          </div>

          <div className="p-5 bg-zinc-900 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider block mb-1">
              Status da Conexão
            </span>
            <div className="text-lg font-bold text-white flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${fonteViva ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
              {fonteViva ? 'Sincronizado (API Câmara)' : 'Aguardando Consulta'}
            </div>
            <span className="text-[11px] text-zinc-500 mt-2 block">
              {fonteViva ? 'Dados ativos via dadosabertos.camara.leg.br' : 'Nenhuma requisição disparada ainda'}
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
              disabled={!fonteViva}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 disabled:opacity-50 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
            {['TODAS', 'GARANTIDORA', 'RESTRITIVA', 'NEUTRA'].map((postura) => (
              <button
                key={postura}
                onClick={() => setFiltroPostura(postura)}
                disabled={!fonteViva}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap inline-flex items-center gap-1.5 disabled:opacity-50 ${
                  filtroPostura === postura
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <span>{postura}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filtroPostura === postura ? 'bg-violet-500 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {contagemPosturas[postura]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contador de resultados exibidos (só aparece após sincronizar) */}
        {fonteViva && (
          <div className="text-xs text-zinc-500 flex items-center justify-between px-1">
            <span>
              Exibindo <strong className="text-zinc-300">{proposicoesFiltradas.length}</strong> de {proposicoes.length} proposições validadas
            </span>
            {(termoBusca || filtroPostura !== 'TODAS') && (
              <button
                onClick={() => { setTermoBusca(''); setFiltroPostura('TODAS'); }}
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Lista / Feed de Proposições */}
        <div className="space-y-4">
          {!fonteViva ? (
            <div className="p-12 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl space-y-3">
              <Database className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm font-medium">
                Nenhum dado carregado no painel
              </p>
              <p className="text-zinc-500 text-xs max-w-md mx-auto">
                Clique no botão <strong className="text-violet-400">"Buscar Dados da API Viva"</strong> no topo da página para iniciar a extração e classificação das proposições legislativas.
              </p>
            </div>
          ) : proposicoesFiltradas.length === 0 ? (
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
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-black text-white font-mono">
                      {item.tipo} {item.numero}/{item.ano}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${item.postura.color}`}>
                      {item.postura.label}
                    </span>
                    {item.dataApresentacao && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.dataApresentacao).toLocaleDateString('pt-BR')}
                      </span>
                    )}
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