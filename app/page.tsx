import Link from 'next/link';
import Image from 'next/image';
import { 
  Terminal, Cpu, Database, Shield, ArrowUpRight, Code, 
  Activity, UserCheck, MessageSquare, MapPin, Scale, AlertTriangle, CheckCircle, Heart
} from 'lucide-react';
import CyberChat from './components/CyberChat';
import { buscarProposicoesCamaraAPI } from './services/camaraService';

// Tipagem para o TypeScript do Next.js
interface Proposicao {
  id: number;
  tipo: string;
  numero: number;
  ano: number;
  ementa: string;
  dataApresentacao: string;
  postura: {
    tipo: 'RESTRITIVA' | 'GARANTIDORA' | 'NEUTRA';
    label: string;
    color: string;
  };
  url: string;
}

interface DadosCamara {
  totalBruto: number;
  validados: Proposicao[];
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Inicialização tipada corretamente para evitar o tipo 'never[]'
  let dadosCamara: DadosCamara = { totalBruto: 0, validados: [] };
  let totalValidados = 0;
  let totalRestritivas = 0;
  let totalGarantidoras = 0;

  try {
    const res = await buscarProposicoesCamaraAPI();
    if (res && Array.isArray(res.validados)) {
      dadosCamara = res as DadosCamara;
      totalValidados = dadosCamara.validados.length;
      
      totalRestritivas = dadosCamara.validados.filter(
        (p: Proposicao) => p.postura?.tipo === 'RESTRITIVA'
      ).length;

      totalGarantidoras = dadosCamara.validados.filter(
        (p: Proposicao) => p.postura?.tipo === 'GARANTIDORA'
      ).length;
    }
  } catch (error) {
    console.error("Aviso: Falha ao carregar dados da Câmara durante o build:", error);
  }

  return (
    <main className="min-h-screen bg-cyber-dark text-cyber-white font-mono p-4 md:p-8 selection:bg-cyber-pink selection:text-black">
      {/* Moldura Global Estilo Terminal */}
      <div className="max-w-6xl mx-auto border border-cyber-pink/30 bg-black/80 p-6 md:p-10 rounded-lg shadow-[0_0_25px_rgba(255,0,127,0.15)] relative overflow-hidden">
        
        {/* Linha Decorativa Topo */}
        <div className="flex justify-between items-center border-b border-cyber-pink/30 pb-4 mb-8 text-xs text-cyber-blue">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyber-green animate-pulse"></span>
            SYSTEM://ONLINE_
          </span>
          <span className="hidden sm:inline">&lt;SOBERANIA_DE_DADOS // COPYLEFT 2026&gt;</span>
        </div>

        {/* HERO SECTION COM FOTO */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-center">
          
          {/* Lado Esquerdo: Textos & Chamada */}
          <div className="md:col-span-2">
            <div className="inline-block bg-cyber-pink/10 border border-cyber-pink text-cyber-pink px-3 py-1 text-xs mb-4 rounded">
              ROTEADO VIA HACKTIVISMO TRANS
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-cyber-white tracking-tight mb-4 leading-tight">
              TECNOLOGIA LIVRE, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-pink via-cyber-blue to-cyber-green">
                DADOS ABERTOS & EMANCIPAÇÃO.
              </span>
            </h1>
            <p className="text-gray-300 max-w-xl text-sm md:text-base leading-relaxed mb-6">
              Desenvolvo ferramentas gratuitas, aplicações interativas e interfaces acessíveis para democratizar o acesso a dados públicos de saúde e redes de cuidado. Sem barreiras de código, sem intermediários.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a href="#ferramentas" className="bg-cyber-pink hover:bg-cyber-pink/80 text-black font-bold px-5 py-2.5 rounded flex items-center gap-2 transition-all shadow-[0_0_12px_#ff007f]">
                <Terminal size={18} /> Acessar Ferramentas
              </a>
              <Link href="/camara" className="border border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 px-5 py-2.5 rounded flex items-center gap-2 transition-all">
                <Scale size={18} /> Painel do Congresso ({totalValidados})
              </Link>
            </div>
          </div>

          {/* Lado Direito: Card de Perfil com Foto */}
          <div className="md:col-span-1">
            <div className="border-2 border-cyber-blue bg-black/90 p-3 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.2)] relative group">
              
              {/* Badge no canto da foto */}
              <div className="absolute top-5 right-5 z-10 bg-black/80 border border-cyber-green text-cyber-green px-2 py-0.5 text-[10px] rounded flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-ping"></span> ONLINE
              </div>

              {/* Moldura da Imagem */}
              <div className="relative w-full h-72 rounded overflow-hidden border border-cyber-pink/50">
                <Image
                  src="/perfil.jpg"
                  alt="Foto de Perfil"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                />
                {/* Linhas CRT overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
              </div>

              {/* Detalhes de Identificação / Operadora */}
              <div className="mt-3 pt-3 border-t border-cyber-blue/40 text-xs">
                <p className="text-cyber-pink font-bold flex items-center gap-1">
                  <UserCheck size={14} /> ARTEMÍSIA://antiCISTEMA
                </p>
                <p className="text-gray-400 text-[11px] mt-1">
                  FUNÇÃO: DEV / PESQUISADORA / ATIVISTA
                </p>
                <p className="text-cyber-green text-[10px] mt-1">
                  STATUS: ATIVO // SOBERANIA DIGITAL
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SEÇÃO DO CHAT INTERATIVO */}
        <section className="mb-16 border-t border-cyber-pink/30 pt-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-cyber-pink flex items-center gap-2">
              <MessageSquare size={20} /> // ASSISTENTE_VIRTUAL
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Converse com o agente interativo sobre ferramentas de dados abertos, projetos e manifesto.
            </p>
          </div>
          <CyberChat />
        </section>

        {/* QUEM SOU / MANIFESTO */}
        <section className="mb-16 border-t border-cyber-blue/20 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold text-cyber-blue flex items-center gap-2 mb-2">
                <Shield size={20} /> // SOBRE_MIM
              </h2>
              <p className="text-xs text-gray-400">Identidade, território e atuação política tecnológica.</p>
            </div>
            <div className="md:col-span-2 bg-cyber-dark/80 border border-cyber-blue/30 p-5 rounded-md relative">
              <p className="text-sm leading-relaxed text-gray-200 mb-4">
                Atuo na interseção entre <strong className="text-cyber-pink">Saúde Coletiva</strong>, <strong className="text-cyber-blue">Análise de Dados</strong> e <strong className="text-cyber-green">Transativismo</strong>. Acredito que a informação pública pertence ao povo, e a tecnologia deve servir para reduzir assimetrias de poder, não para concentrá-lo.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-black/60 border border-cyber-green/40 text-cyber-green px-2 py-1 rounded">#SaúdeColetiva</span>
                <span className="bg-black/60 border border-cyber-pink/40 text-cyber-pink px-2 py-1 rounded">#Transfeminismo</span>
                <span className="bg-black/60 border border-cyber-blue/40 text-cyber-blue px-2 py-1 rounded">#OpenData</span>
                <span className="bg-black/60 border border-purple-400/40 text-purple-300 px-2 py-1 rounded">#ReactJS & Next.js</span>
                <span className="bg-black/60 border border-gray-600 text-gray-300 px-2 py-1 rounded">#Python</span>
              </div>
            </div>
          </div>
        </section>

        {/* FERRAMENTAS / PORTFÓLIO */}
        <section id="ferramentas" className="mb-16 border-t border-cyber-blue/20 pt-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl font-bold text-cyber-green flex items-center gap-2">
                <Cpu size={20} /> // FERRAMENTAS_DISPONÍVEIS
              </h2>
              <p className="text-xs text-gray-400 mt-1">Softwares, jogos interativos e scripts totalmente gratuitos e livres.</p>
            </div>
            <span className="text-xs text-cyber-green border border-cyber-green/30 px-2 py-1 rounded hidden sm:inline">
              STATUS: SERVIDORES ATIVOS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 1: SEM ARMADURA (NOVO JOGO REACT / HTML) */}
            <div className="border border-pink-400/60 bg-black/60 p-5 rounded-lg hover:border-pink-300 transition-all group relative overflow-hidden shadow-[0_0_15px_rgba(255,183,178,0.15)]">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-rose-300 border border-rose-300/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                  <Heart size={12} className="text-rose-400" /> REACTJS / WEB GAME
                </span>
                <span className="text-xs text-cyber-green flex items-center gap-1">● ONLINE</span>
              </div>
              
              <h3 className="text-lg font-bold text-cyber-white group-hover:text-pink-300 transition-colors">
               Nós em Nós - um baralho sobre afeto e nós que a gente desata 💖
              </h3>
              
              <p className="text-xs text-gray-400 mt-2 mb-4 leading-relaxed">
                Jogo de cartas interativo para trocas sinceras, escuta ativa e vulnerabilidade. Inclui gerador de cartas e guia territorial de atendimento psicológico a baixo custo em Porto Alegre.
              </p>

              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                <span className="text-gray-500">ReactJS / Tailwind CSS</span>
                <Link href="sem-armadura" className="text-pink-300 hover:underline flex items-center gap-1 font-bold">
                  Jogar Agora <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* CARD 2: OBSERVATÓRIO LEGISLATIVO DA CÂMARA */}
            <div className="border border-cyber-pink/60 bg-black/60 p-5 rounded-lg hover:border-cyber-pink transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-cyber-pink border border-cyber-pink/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                  <Scale size={12} /> LEGISLAÇÃO / CÂMARA
                </span>
                <span className="text-xs text-cyber-green flex items-center gap-1">● EM TEMPO REAL</span>
              </div>
              
              <h3 className="text-lg font-bold text-cyber-white group-hover:text-cyber-pink transition-colors">
                Observatório de Proposições Trans
              </h3>
              
              <p className="text-xs text-gray-400 mt-2 mb-4 leading-relaxed">
                Monitoramento contínuo via API da Câmara dos Deputados com limpeza por Regex do TCR e classificação discursiva das matérias legislativas.
              </p>

              {/* CONTADORES EM TEMPO REAL */}
              <div className="grid grid-cols-3 gap-2 bg-black/80 border border-gray-800 p-2.5 rounded my-3 text-center">
                <div className="border-r border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase">Validadas</span>
                  <span className="text-base font-extrabold text-cyber-white">{totalValidados}</span>
                </div>
                <div className="border-r border-gray-800">
                  <span className="text-[10px] text-red-400 block uppercase flex items-center justify-center gap-1">
                    <AlertTriangle size={10} /> Restritivas
                  </span>
                  <span className="text-base font-extrabold text-red-400">{totalRestritivas}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block uppercase flex items-center justify-center gap-1">
                    <CheckCircle size={10} /> Garantidoras
                  </span>
                  <span className="text-base font-extrabold text-emerald-400">{totalGarantidoras}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                <span className="text-gray-500">API v2 / Dados Abertos</span>
                <Link href="/painel-camara" className="text-cyber-pink hover:underline flex items-center gap-1 font-bold">
                  Abrir Monitor <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
            
            {/* Card Ferramenta 3 */}
            <div className="border border-cyber-pink/40 bg-black/50 p-5 rounded-lg hover:border-cyber-pink transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-cyber-pink border border-cyber-pink/30 px-2 py-0.5 rounded">API / SAÚDE</span>
                <span className="text-xs text-cyber-green flex items-center gap-1">● ONLINE</span>
              </div>
              <h3 className="text-lg font-bold text-cyber-white group-hover:text-cyber-pink transition-colors">
                Extrator de Dados do DataSUS
              </h3>
              <p className="text-xs text-gray-400 mt-2 mb-4 leading-relaxed">
                Interface simples para baixar relatórios consolidados de atendimento sem precisar codificar scripts em R ou Python.
              </p>
              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                <span className="text-gray-500">Formato: CSV / JSON</span>
                <Link href="/consulta-ministerio" className="text-cyber-blue hover:underline flex items-center gap-1">
                  Executar <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Card Ferramenta 4 - Mapeamento Quilombola & Atenção Primária */}
            <div className="border border-cyber-green/40 bg-black/50 p-5 rounded-lg hover:border-cyber-green transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-cyber-green border border-cyber-green/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <MapPin size={12} /> GEO / SAÚDE COLETIVA
                </span>
                <span className="text-xs text-cyber-green flex items-center gap-1">● ONLINE</span>
              </div>
              
              <h3 className="text-lg font-bold text-cyber-white group-hover:text-cyber-green transition-colors">
                Quilombos Urbanos & Atenção Primária
              </h3>
              
              <p className="text-xs text-gray-400 mt-2 mb-4 leading-relaxed">
                Mapa interativo com a densidade populacional censitária (Censo IBGE 2022 vs. Estimativa Territorial) dos 11 territórios de Porto Alegre e a vinculação com as Unidades de Saúde de referência.
              </p>
              
              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                <span className="text-gray-500">Dados: IBGE / e-SUS APS</span>
                <Link href="/quilombos" className="text-cyber-green hover:underline flex items-center gap-1 font-bold">
                  Mapeamento <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* DESTAQUE API SEM PYTHON */}
        <section className="bg-gradient-to-r from-cyber-pink/20 via-black to-cyber-blue/20 border border-cyber-blue/50 p-6 rounded-lg text-center md:text-left md:flex items-center justify-between gap-6">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-cyber-white flex items-center justify-center md:justify-start gap-2">
              <Activity className="text-cyber-green" size={20} /> Painel de Consulta Direta à API
            </h3>
            <p className="text-xs text-gray-300 mt-1 max-w-xl">
              Projetado para pesquisadores, estudantes e ativistas que não utilizam Python. Faça pesquisas diretas nos bancos do Ministério da Saúde e baixe em Excel/CSV.
            </p>
          </div>
          <Link 
            href="/consulta-ministerio" 
            className="whitespace-nowrap bg-cyber-green hover:bg-cyber-green/80 text-black font-extrabold px-6 py-3 rounded text-sm transition-all shadow-[0_0_15px_#00ff66] inline-block"
          >
            ABRIR PAINEL DE CONSULTA
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 pt-6 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>// TECNOLOGIA A SERVIÇO DA LIBERDADE // CÓDIGO ABERTO</p>
          <p className="text-cyber-pink">Trans Resistance & Free Software</p>
        </footer>

      </div>
    </main>
  );
}