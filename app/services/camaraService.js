/**
 * Serviço de Integração e Pós-Processamento da API da Câmara dos Deputados
 */

// Regex para validar relevância temática APENAS em buscas amplas/ambíguas ("trans" isolado ou por tema)
const RELEX_KEYWORDS = [
  /\btrans\b/i,
  /transmasculin/i,
  /transfemin/i,
  /transmulher/i,
  /transhomem/i,
  /transexu/i,
  /travesti/i,
  /transg[êe]ner/i,
  /identidade de g[êe]nero/i,
  /transi[çc][ãa]o de g[êe]nero/i,
  /nome social/i,
  /processo transexualizador/i,
  /transfob/i,
  /\blgbt/i,
  /orienta[çc][ãa]o sexual/i,
  /diversidade sexual/i,
  /redesigna[çc][ãa]o sexual/i,
  /hormonioterapia/i
];

// Regex para excluir falsos positivos institucionais/urbanos
const EXCLUSION_KEYWORDS = [
  /transpar[êe]ncia/i,
  /transporte/i,
  /transgeni/i,
  /transa[çc][ãa]o/i,
  /transmiss[ãa]o/i,
  /transfere/i,
  /transfer[êe]ncia/i,
  /tr[âa]nsito/i
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchComRetry(url, signal, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    if (signal?.aborted) return null;

    try {
      const response = await fetch(url, {
        headers: { "Accept": "application/json" },
        signal
      });

      if (response.ok) return await response.json();

      if (response.status === 429 || response.status >= 500) {
        await sleep(1000 * (i + 1));
        continue;
      }
      return null;
    } catch (e) {
      if (e.name === 'AbortError' || signal?.aborted) return null;
      if (i < tentativas - 1) await sleep(1000 * (i + 1));
    }
  }
  return null;
}

export function classificarPostura(ementa) {
  const ementaLower = (ementa || "").toLowerCase();

  const termosRestritivos = [
    'proíbe', 'proibir', 'vedação', 'vedar', 'sustação', 'sustar',
    'restrição', 'restringir', 'anulação', 'revogação', 'impedir', 'proibição',
    'criminaliza', 'tipifica como crime'
  ];

  const termosGarantidores = [
    'garante', 'garantir', 'assegura', 'assegurar', 'direitos', 'isenção',
    'crimes praticados em razão de gênero', 'proteção', 'combate à transfobia',
    'inclusão', 'reconhecimento', 'criação do dia', 'atendimento humanizado',
    'valorização', 'política nacional', 'programa', 'Cultura Ballroom', 'Cultural Imaterial', 'Ballroom '
  ];

  if (termosRestritivos.some(t => ementaLower.includes(t))) {
    return { tipo: 'RESTRITIVA', label: 'Restritiva / Reativa', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
  }
  if (termosGarantidores.some(t => ementaLower.includes(t))) {
    return { tipo: 'GARANTIDORA', label: 'Garantidora / Propositiva', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  }
  return { tipo: 'NEUTRA', label: 'Geral / Processual', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
}

async function buscarPaginado(parametrosBase, rotuloLog, precisaValidarRegex, signal, maxPaginas = 50) {
  const baseUrl = "https://dadosabertos.camara.leg.br/api/v2/proposicoes";
  let resultados = [];

  for (let pagina = 1; pagina <= maxPaginas; pagina++) {
    if (signal?.aborted) break;

    const params = new URLSearchParams({
      ...parametrosBase,
      ordem: "DESC",
      ordenarPor: "id",
      itens: "100",
      pagina: pagina.toString()
    });

    const data = await fetchComRetry(`${baseUrl}?${params.toString()}`, signal);
    if (!data || !Array.isArray(data.dados) || data.dados.length === 0) {
      break;
    }

    const loteMarcado = data.dados.map(item => ({
      ...item,
      _precisaValidarRegex: precisaValidarRegex,
      _origemConsulta: rotuloLog
    }));

    resultados = resultados.concat(loteMarcado);

    const temProxima = Array.isArray(data.links) && data.links.some(l => l.rel === "next");
    if (!temProxima) break;

    await sleep(150);
  }

  return resultados;
}

/**
 * Busca proposições sob demanda quando acionada pelo botão da interface.
 * @param {Object} opcoes - { onProgresso?: (msg: string) => void, signal?: AbortSignal }
 */
export async function buscarProposicoesCamaraAPI({ onProgresso, signal } = {}) {
  const tiposAceitos = ["PEC", "PLP", "MPV", "PL", "PLV", "PDL", "PRC", "REQ", "RIC", "RCP", "MSC", "INC"];

  const termosInequivocos = [
    "transexual",
    "transexuais",
    "transexualidade",
    "travesti",
    "travestis",
    "transgênero",
    "transgêneros",
    "transgenero",
    "identidade de gênero",
    "nome social",
    "transfobia",
    "lgbt",
    "lgbtqia"
  ];

  const termosAmbiguos = ["trans"];

  const temasComplementares = [
    { codTema: "40", nome: "Tema: Direitos Humanos e Minorias" },
    { codTema: "56", nome: "Tema: Saúde" }
  ];

  const totalEtapas = termosInequivocos.length + termosAmbiguos.length + temasComplementares.length;
  let etapaAtual = 0;
  const resultadosBrutosAcumulados = [];

  for (const termo of termosInequivocos) {
    if (signal?.aborted) break;
    etapaAtual++;
    onProgresso?.(`Consultando descritor "${termo}" (${etapaAtual}/${totalEtapas})...`);
    const lote = await buscarPaginado({ keywords: termo }, `keyword:${termo}`, false, signal, 50);
    resultadosBrutosAcumulados.push(...lote);
    await sleep(150);
  }

  for (const termo of termosAmbiguos) {
    if (signal?.aborted) break;
    etapaAtual++;
    onProgresso?.(`Consultando termo amplo "${termo}" (${etapaAtual}/${totalEtapas})...`);
    const lote = await buscarPaginado({ keywords: termo }, `keyword:${termo}`, true, signal, 50);
    resultadosBrutosAcumulados.push(...lote);
    await sleep(150);
  }

  for (const tema of temasComplementares) {
    if (signal?.aborted) break;
    etapaAtual++;
    onProgresso?.(`Varrendo ${tema.nome} (${etapaAtual}/${totalEtapas})...`);
    const loteTema = await buscarPaginado({ codTema: tema.codTema }, tema.nome, true, signal, 50);
    resultadosBrutosAcumulados.push(...loteTema);
    await sleep(150);
  }

  const mapaUnico = new Map();
  resultadosBrutosAcumulados.forEach(prop => {
    if (!prop || !prop.id) return;

    if (!mapaUnico.has(prop.id)) {
      mapaUnico.set(prop.id, prop);
    } else {
      const existente = mapaUnico.get(prop.id);
      if (!prop._precisaValidarRegex && existente._precisaValidarRegex) {
        mapaUnico.set(prop.id, { ...prop, _precisaValidarRegex: false });
      }
    }
  });

  const todosResultadosBrutos = Array.from(mapaUnico.values());

  const validados = todosResultadosBrutos.filter((prop) => {
    const tipoValido = tiposAceitos.includes(prop.siglaTipo);
    if (!tipoValido) return false;

    const textoCompleto = `${prop.ementa || ''} ${prop.ementaDetalhada || ''}`;

    if (!prop._precisaValidarRegex) {
      return true;
    }

    const temRelevancia = RELEX_KEYWORDS.some((regex) => regex.test(textoCompleto));
    const temExclusao = EXCLUSION_KEYWORDS.some((regex) => regex.test(textoCompleto));

    if (temExclusao && !temRelevancia) return false;

    return temRelevancia;
  });

  return {
    totalBruto: todosResultadosBrutos.length,
    validados: validados.map(prop => ({
      id: prop.id,
      tipo: prop.siglaTipo,
      numero: prop.numero,
      ano: prop.ano,
      ementa: prop.ementa,
      dataApresentacao: prop.dataApresentacao,
      postura: classificarPostura(prop.ementa),
      url: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${prop.id}`
    }))
  };
}