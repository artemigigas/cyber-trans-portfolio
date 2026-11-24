import Link from 'next/link';
import Image from 'next/image';
import {
  Cpu,
  Shield,
  ArrowUpRight,
  Activity,
  UserCheck,
  MessageSquare,
  MapPin,
  Scale,
  Heart,
  FileText,
  BarChart3,
  BookOpen,
  Camera,
  Database,
} from 'lucide-react';
import CyberChat from './components/CyberChat';

// Altere para true quando desejar exibir a assistente de IA novamente
const SHOW_AI_ASSISTANT = false;

export const dynamic = 'force-static';

export default function Home() {
  return (
    <main className="min-h-screen bg-cyber-dark text-cyber-white font-sans p-4 md:p-8 selection:bg-cyber-pink selection:text-black">
      {/* Container Principal */}
      <div className="max-w-6xl mx-auto border border-cyber-pink/25 bg-black/85 p-6 md:p-10 rounded-xl shadow-[0_0_25px_rgba(255,0,127,0.1)] relative overflow-hidden">
        
        {/* Barra Superior */}
        <header className="flex flex-wrap justify-between items-center border-b border-gray-800 pb-4 mb-10 text-xs font-mono text-gray-400 gap-2">
          <span className="flex items-center gap-2 text-cyber-blue">
            <span className="h-2 w-2 rounded-full bg-cyber-green"></span>
            PORTO ALEGRE, RS • POLÍTICAS PÚBLICAS, DADOS & COMUNICAÇÃO
          </span>
          <nav className="flex items-center gap-4">
            <a href="#atuacao" className="hover:text-cyber-white transition-colors">
              Eixos de Atuação
            </a>
            <a href="#projetos" className="hover:text-cyber-white transition-colors">
              Projetos
            </a>
            <Link
              href="/cv"
              prefetch={false}
              className="text-cyber-pink hover:underline flex items-center gap-1 font-semibold"
            >
              <FileText size={13} /> Currículo / PDF
            </Link>
          </nav>
        </header>

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-center">
          {/* Lado Esquerdo: Apresentação Estratégica */}
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2 bg-cyber-blue/10 border border-cyber-blue/40 text-cyber-blue px-3 py-1 text-xs font-mono mb-4 rounded">
              SANITARISTA • ANÁLISE DE DADOS, TECH & COMUNICAÇÃO POLÍTICA
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-cyber-white tracking-tight mb-4 leading-tight">
              Inteligência de Dados, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-pink via-cyber-blue to-cyber-green">
                Saúde Coletiva & Mobilização.
              </span>
            </h1>

            <p className="text-gray-300 max-w-2xl text-sm md:text-base leading-relaxed mb-6">
              Sou <strong className="text-white">Artemísia de Medeiros Burgos</strong>, Sanitarista (UFRGS) e Residente em Gestão em Saúde Coletiva. Uno análise de dados públicos (DATASUS, IBGE, APIs legislativas), desenvolvimento digital e produção audiovisual para subsidiar decisões, fiscalização parlamentar e campanhas territoriais.
            </p>

            <div className="flex flex-wrap gap-3 font-mono text-xs md:text-sm">
              <Link
                href="/painel-camara"
                prefetch={false}
                className="bg-cyber-pink hover:bg-cyber-pink/90 text-black font-bold px-5 py-2.5 rounded flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,0,127,0.3)]"
              >
                <Scale size={16} /> Observatório Legislativo
              </Link>
              <Link
                href="/cv"
                prefetch={false}
                className="border border-cyber-blue/60 text-cyber-blue hover:bg-cyber-blue/10 px-5 py-2.5 rounded flex items-center gap-2 transition-all"
              >
                <FileText size={16} /> Currículo (PDF)
              </Link>
              <a
                href="https://wa.me/5551999361997"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-cyber-green/60 text-cyber-green hover:bg-cyber-green/10 px-5 py-2.5 rounded flex items-center gap-2 transition-all"
              >
                Contato Direto
              </a>
            </div>
          </div>

          {/* Lado Direito: Card de Perfil */}
          <div className="md:col-span-1">
            <div className="border border-cyber-blue/40 bg-zinc-950/90 p-3.5 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.1)] relative group">
              <div className="relative w-full h-72 rounded-lg overflow-hidden border border-gray-800">
                <Image
                  src="/perfilv3.jpg"
                  alt="Artemísia de Medeiros Burgos"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              <div className="mt-3.5 pt-3 border-t border-gray-800 font-mono text-xs">
                <p className="text-cyber-white font-bold flex items-center gap-1.5">
                  <UserCheck size={14} className="text-cyber-green" /> Artemísia de M. Burgos
                </p>
                <p className="text-gray-400 text-[11px] mt-1">
                  Sanitarista • Gestão em Saúde (UFRGS)
                </p>
                <p className="text-cyber-blue text-[11px] mt-0.5">
                  Dados • Políticas Públicas • Audiovisual
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ASSISTENTE VIRTUAL (OCULTA ENQUANTO EM DESENVOLVIMENTO) */}
        {SHOW_AI_ASSISTANT && (
          <section className="mb-16 border-t border-gray-800 pt-10">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-cyber-pink font-mono flex items-center gap-2">
                <MessageSquare size={18} /> ASSISTENTE VIRTUAL
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Converse com o agente interativo sobre ferramentas de dados abertos, projetos e indicadores.
              </p>
            </div>
            <CyberChat />
          </section>
        )}

        {/* EIXOS DE ENTREGA PARA MANDATO & GESTÃO */}
        <section id="atuacao" className="mb-16 border-t border-gray-800 pt-10">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-cyber-blue font-mono flex items-center gap-2">
              <Shield size={18} /> EIXOS DE ATUAÇÃO
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Atuação integrada entre assessoria técnica em políticas públicas, inteligência de dados, desenvolvimento e comunicação.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-950/70 border border-gray-800 hover:border-cyber-pink/50 p-4 rounded-lg transition-colors">
              <div className="text-cyber-pink font-mono text-xs font-bold mb-2 flex items-center gap-1.5">
                <BookOpen size={14} /> 01. POLÍTICAS & SUS
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Gestão e planejamento em saúde (SMS POA), políticas de equidade (População Negra, LGBTQIA+, Quilombola), notas técnicas e subsídio para PLs e fiscalização.
              </p>
            </div>

            <div className="bg-zinc-950/70 border border-gray-800 hover:border-cyber-blue/50 p-4 rounded-lg transition-colors">
              <div className="text-cyber-blue font-mono text-xs font-bold mb-2 flex items-center gap-1.5">
                <BarChart3 size={14} /> 02. DADOS & MÉTRICAS
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Extração e cruzamento de bases oficiais (DATASUS, Censo IBGE, e-SUS), geoprocessamento territorial, indicadores de impacto e telemetria de engajamento.
              </p>
            </div>

            <div className="bg-zinc-950/70 border border-gray-800 hover:border-cyber-green/50 p-4 rounded-lg transition-colors">
              <div className="text-cyber-green font-mono text-xs font-bold mb-2 flex items-center gap-1.5">
                <Cpu size={14} /> 03. TECH & MONITORAMENTO
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Observatórios legislativos via API, aplicações web mobile-first para mobilização de rua, formulários inteligentes e automações (React, Next.js, Python, Supabase).
              </p>
            </div>

            <div className="bg-zinc-950/70 border border-gray-800 hover:border-purple-400/50 p-4 rounded-lg transition-colors">
              <div className="text-purple-300 font-mono text-xs font-bold mb-2 flex items-center gap-1.5">
                <Camera size={14} /> 04. FOTO, VÍDEO & DESIGN
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Fotografia documental e territorial, captação e edição de vídeo, operação técnica de livestreams (StreamYard/YouTube) e design editorial de campanhas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono mt-5">
            <span className="bg-zinc-900 border border-gray-700 text-gray-300 px-2.5 py-1 rounded">Saúde Coletiva (UFRGS)</span>
            <span className="bg-zinc-900 border border-gray-700 text-gray-300 px-2.5 py-1 rounded">DATASUS & IBGE</span>
            <span className="bg-zinc-900 border border-gray-700 text-gray-300 px-2.5 py-1 rounded">Monitoramento Legislativo</span>
            <span className="bg-zinc-900 border border-gray-700 text-gray-300 px-2.5 py-1 rounded">React / Next.js / Python</span>
            <span className="bg-zinc-900 border border-gray-700 text-gray-300 px-2.5 py-1 rounded">Fotografia & Edição Audiovisual</span>
          </div>
        </section>

        {/* PROJETOS & OBSERVATÓRIOS EM PRODUÇÃO */}
        <section id="projetos" className="mb-16 border-t border-gray-800 pt-10">
          <div className="flex flex-wrap justify-between items-end mb-8 gap-2">
            <div>
              <h2 className="text-lg font-bold text-cyber-green font-mono flex items-center gap-2">
                <Cpu size={18} /> PROJETOS, OBSERVATÓRIOS & CAMPANHAS
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Ferramentas abertas e ações territoriais desenvolvidas para fiscalização, pesquisa e mobilização social.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD 1: OBSERVATÓRIO LEGISLATIVO DA CÂMARA */}
            <div className="border border-cyber-pink/50 bg-zinc-950/80 p-5 rounded-lg hover:border-cyber-pink transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 font-mono">
                  <span className="text-[11px] text-cyber-pink bg-cyber-pink/10 border border-cyber-pink/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                    <Scale size={12} /> INTELIGÊNCIA LEGISLATIVA
                  </span>
                  <span className="text-[11px] text-cyber-blue">● SOB DEMANDA</span>
                </div>

                <h3 className="text-lg font-bold text-cyber-white group-hover:text-cyber-pink transition-colors">
                  Observatório de Proposições Legislativas
                </h3>

                <p className="text-xs text-gray-300 mt-2 mb-4 leading-relaxed">
                  Monitoramento via API da Câmara dos Deputados com filtragem temática por Regex, varredura por descritores e classificação discursiva automatizada para subsidiar acompanhamento parlamentar.
                </p>

                {/* INDICADORES DE MÓDULO (SEM BLOQUEIO DE API NA HOME) */}
                <div className="grid grid-cols-3 gap-2 bg-black/80 border border-gray-800 p-2.5 rounded my-3 text-center font-mono">
                  <div className="border-r border-gray-800">
                    <span className="text-[10px] text-gray-400 block uppercase">Extração</span>
                    <span className="text-xs font-bold text-cyber-white flex items-center justify-center gap-1 mt-0.5">
                      <Database size={11} className="text-cyber-pink" /> API v2
                    </span>
                  </div>
                  <div className="border-r border-gray-800">
                    <span className="text-[10px] text-red-400 block uppercase">Classificação</span>
                    <span className="text-xs font-bold text-red-400 block mt-0.5">Restritivas</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block uppercase">Classificação</span>
                    <span className="text-xs font-bold text-emerald-400 block mt-0.5">Garantidoras</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs font-mono mt-2">
                <span className="text-gray-500">API Câmara v2 / Regex</span>
                <Link
                  href="/painel-camara"
                  prefetch={false}
                  className="text-cyber-pink hover:underline flex items-center gap-1 font-bold"
                >
                  Abrir Monitor <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* CARD 2: QUAL TEU CORRE / CORRE PRETO */}
            <div className="border border-amber-400/50 bg-zinc-950/80 p-5 rounded-lg hover:border-amber-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 font-mono">
                  <span className="text-[11px] text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded font-semibold">
                    MOBILIZAÇÃO & MÉTRICAS DE RUA
                  </span>
                  <span className="text-[11px] text-gray-400">MOBILE-FIRST</span>
                </div>

                <h3 className="text-lg font-bold text-cyber-white group-hover:text-amber-300 transition-colors">
                  Qual Teu Corre? / Corre Preto (20N)
                </h3>

                <p className="text-xs text-gray-300 mt-2 mb-4 leading-relaxed">
                  Aplicação web, identidade visual e materiais gráficos (digitais e backdrop físico) para ação territorial de saúde da população negra, equipada com telemetria de cliques e mapeamento de demanda em tempo real.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs font-mono">
                <span className="text-gray-500">Next.js / Telemetria / Design</span>
                <a
                  href="https://20novembro-eight.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:underline flex items-center gap-1 font-bold"
                >
                  Acessar Campanha <ArrowUpRight size={14} />
                </a>
              </div>
            </div>

            {/* CARD 3: MAPEAMENTO QUILOMBOLA & ATENÇÃO PRIMÁRIA */}
            <div className="border border-cyber-green/40 bg-zinc-950/80 p-5 rounded-lg hover:border-cyber-green transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 font-mono">
                  <span className="text-[11px] text-cyber-green bg-cyber-green/10 border border-cyber-green/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                    <MapPin size={12} /> GEOPROCESSAMENTO & SUS
                  </span>
                  <span className="text-[11px] text-amber-300 border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 rounded">
                    EM DESENVOLVIMENTO
                  </span>
                </div>

                <h3 className="text-lg font-bold text-cyber-white group-hover:text-cyber-green transition-colors">
                  Quilombos Urbanos & Atenção Primária
                </h3>

                <p className="text-xs text-gray-300 mt-2 mb-4 leading-relaxed">
                  Protótipo em fase de validação cruzando densidade populacional (Censo IBGE 2022 vs. Estimativa Territorial) dos 11 quilombos urbanos de Porto Alegre com suas Unidades de Saúde de referência.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs font-mono">
                <span className="text-gray-500">Dados: IBGE / e-SUS APS (Em validação)</span>
                <Link
                  href="/quilombos"
                  prefetch={false}
                  className="text-cyber-green hover:underline flex items-center gap-1 font-bold"
                >
                  Ver Protótipo <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* CARD 4: EXTRATOR DE DADOS DO DATASUS */}
            <div className="border border-cyber-blue/40 bg-zinc-950/80 p-5 rounded-lg hover:border-cyber-blue transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 font-mono">
                  <span className="text-[11px] text-cyber-blue bg-cyber-blue/10 border border-cyber-blue/30 px-2 py-0.5 rounded font-semibold">
                    DADOS ABERTOS / SAÚDE
                  </span>
                  <span className="text-[11px] text-gray-400">CSV / JSON</span>
                </div>

                <h3 className="text-lg font-bold text-cyber-white group-hover:text-cyber-blue transition-colors">
                  Extrator Simplificado do DataSUS
                </h3>

                <p className="text-xs text-gray-300 mt-2 mb-4 leading-relaxed">
                  Ferramenta de consulta direta aos bancos do Ministério da Saúde para exportar relatórios consolidados em planilhas sem exigir programação em R ou Python.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs font-mono">
                <span className="text-gray-500">API Ministério da Saúde</span>
                <Link
                  href="/consulta-ministerio"
                  prefetch={false}
                  className="text-cyber-blue hover:underline flex items-center gap-1 font-bold"
                >
                  Executar Consulta <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* CARD 5: NÓS EM NÓS / MOBILIZAÇÃO E REDE DE CUIDADO */}
            <div className="md:col-span-2 border border-pink-400/40 bg-zinc-950/80 p-5 rounded-lg hover:border-pink-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 font-mono">
                  <span className="text-[11px] text-rose-300 bg-rose-400/10 border border-rose-300/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                    <Heart size={12} className="text-rose-400" /> REDE DE CUIDADO & EDUCAÇÃO EM SAÚDE
                  </span>
                  <span className="text-[11px] text-gray-400">WEB APP INTERATIVO</span>
                </div>

                <h3 className="text-lg font-bold text-cyber-white group-hover:text-pink-300 transition-colors">
                  Nós em Nós & Guia de Saúde Mental
                </h3>

                <p className="text-xs text-gray-300 mt-2 mb-4 leading-relaxed">
                  Aplicação interativa voltada à educação em saúde e saúde mental, integrada a um diretório territorial de atendimento psicológico a baixo custo em Porto Alegre.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs font-mono">
                <span className="text-gray-500">React / Tailwind CSS</span>
                <Link
                  href="/sem-armadura"
                  prefetch={false}
                  className="text-pink-300 hover:underline flex items-center gap-1 font-bold"
                >
                  Abrir Aplicação <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* BLOCO RESUMO DE OUTRAS ENTREGAS INSTITUCIONAIS */}
          <div className="mt-6 bg-zinc-950/60 border border-gray-800 p-5 rounded-lg">
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-3">
              Outras Entregas Técnicas, Audiovisuais & Produção Institucional
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-400">
              <li className="border-l-2 border-cyber-pink pl-3">
                <strong className="text-gray-200 block">Suite TRANSITA PRO (e-SUS PEC)</strong>
                Extensão de telemetria e estratificação de risco em tempo real para equipes da Atenção Primária.
              </li>
              <li className="border-l-2 border-cyber-blue pl-3">
                <strong className="text-gray-200 block">Boletim Epidemiológico de Doença Falciforme (2024–2026)</strong>
                Análise de indicadores de morbimortalidade e linha de cuidado para gestão e controle social (SMS POA).
              </li>
              <li className="border-l-2 border-cyber-green pl-3">
                <strong className="text-gray-200 block">Cartilha Municipal LGBTQIA+ (SMS Porto Alegre)</strong>
                Coautoria de material técnico de acolhimento e cuidado integral para profissionais da rede SUS.
              </li>
              <li className="border-l-2 border-purple-400 pl-3">
                <strong className="text-gray-200 block">Jovens Promotores da Saúde & Produção Audiovisual</strong>
                Coordenação pedagógica, plataforma digital, cobertura fotográfica e operação de transmissões ao vivo.
              </li>
            </ul>
          </div>
        </section>

        {/* CHAMADA PARA CONSULTA DIRETA */}
        <section className="bg-gradient-to-r from-cyber-pink/15 via-zinc-950 to-cyber-blue/15 border border-cyber-blue/40 p-6 rounded-lg text-center md:text-left md:flex items-center justify-between gap-6">
          <div className="mb-4 md:mb-0">
            <h3 className="text-base md:text-lg font-bold text-cyber-white flex items-center justify-center md:justify-start gap-2">
              <Activity className="text-cyber-green" size={20} /> Consulta Direta aos Dados do Ministério da Saúde
            </h3>
            <p className="text-xs text-gray-300 mt-1 max-w-xl">
              Interface desenvolvida para assessores, pesquisadores e conselheiros de saúde extraírem indicadores oficiais em Excel/CSV sem barreiras técnicas.
            </p>
          </div>
          <Link
            href="/consulta-ministerio"
            prefetch={false}
            className="whitespace-nowrap bg-cyber-green hover:bg-cyber-green/90 text-black font-bold font-mono px-6 py-3 rounded text-xs md:text-sm transition-all shadow-[0_0_15px_rgba(0,255,102,0.25)] inline-block"
          >
            ABRIR PAINEL DE CONSULTA
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 pt-6 border-t border-gray-800 text-xs font-mono text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>Artemísia de Medeiros Burgos • Sanitarista, Dados & Comunicação</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/artemigigas"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyber-white transition-colors"
            >
              GitHub
            </a>
            <Link href="/cv" prefetch={false} className="text-cyber-pink hover:underline">
              Currículo (PDF)
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}