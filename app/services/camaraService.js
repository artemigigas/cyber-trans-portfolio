/**
 * Serviço de Integração e Pós-Processamento da API da Câmara dos Deputados
 */

// Regex para validar relevância temática do TCR
const RELEX_KEYWORDS = [
  /\btrans\b/i,
  /transexu/i,
  /travesti/i,
  /transgenero/i,
  /transgênero/i,
  /identidade de g[êe]nero/i,
  /nome social/i,
  /processo transexualizador/i,
  /\blgbt/i,
  /\blgbtq/i
];

// Regex para excluir puramente falsos positivos institucionais/urbanos
const EXCLUSION_KEYWORDS = [
  /transpar[êe]ncia/i,
  /transporte/i,
  /transi[çc][ãa]o/i,
  /transgeni/i,
  /transa[çc][ãa]o/i,
  /transmiss[ãa]o/i,
  /transfere/i,
  /transfer[êe]ncia/i,
];

/**
 * Classifica a postura discursiva/normativa da ementa
 */
export function classificarPostura(ementa) {
  const ementaLower = ementa.toLowerCase();
  
  const termosRestritivos = [
    'proíbe', 'proibir', 'vedação', 'vedar', 'sustação', 'sustar', 
    'restrição', 'restringir', 'anulação', 'revogação', 'impedir', 'proibição'
  ];
  
  const termosGarantidores = [
    'garante', 'garantir', 'assegura', 'assegurar', 'direitos', 'isenção', ' crimes praticados em razão de gênero','proteção',
    'combate à transfobia', 'inclusão', 'reconhecimento', 'criação do dia', 'atendimento humanizado', 'valorização'
  ];

  if (termosRestritivos.some(t => ementaLower.includes(t))) {
    return { tipo: 'RESTRITIVA', label: 'Restritiva / Reativa', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
  }
  if (termosGarantidores.some(t => ementaLower.includes(t))) {
    return { tipo: 'GARANTIDORA', label: 'Garantidora / Propositiva', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  }
  return { tipo: 'NEUTRA', label: 'Geral / Processual', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
}

/**
 * Faz requisição por palavra-chave específica na API da Câmara
 */
async function buscarPorPalavra(palavra) {
  const baseUrl = "https://dadosabertos.camara.leg.br/api/v2/proposicoes";
  let resultados = [];
  
  // Consulta até 3 páginas (300 itens por palavra-chave)
  for (let pagina = 1; pagina <= 3; pagina++) {
    try {
      const params = new URLSearchParams({
        keywords: palavra,
        ordem: "DESC",
        ordenarPor: "id",
        itens: "100",
        pagina: pagina.toString()
      });

      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) break;

      const data = await response.json();
      const dados = data.dados || [];
      if (dados.length === 0) break;

      resultados = [...resultados, ...dados];
    } catch (e) {
      console.error(`Erro ao buscar termo '${palavra}':`, e);
      break;
    }
  }

  return resultados;
}

/**
 * Busca proposições na API oficial da Câmara e executa limpeza
 */
export async function buscarProposicoesCamaraAPI() {
  const tiposAceitos = ["PEC", "PLP", "MPV", "PL", "PLV", "PDL", "PRC", "REQ", "RIC", "RCP", "MSC", "INC"];
  
  // Palavras-chave estratégicas enviadas à API
  const termosBusca = ["trans", "transexual", "travesti", "transgenero", "nome social", "lgbt"];
  
  // Busca em paralelo para trazer uma amostra expressiva da API
  const buscaPromessas = termosBusca.map(termo => buscarPorPalavra(termo));
  const resultadosArrays = await Promise.all(buscaPromessas);

  // Unifica e remove duplicados por ID do projeto
  const mapaUnico = new Map();
  resultadosArrays.flat().forEach(prop => {
    if (prop && prop.id && !mapaUnico.has(prop.id)) {
      mapaUnico.set(prop.id, prop);
    }
  });

  const todosResultadosBrutos = Array.from(mapaUnico.values());

  // Filtragem e Limpeza Discursiva do TCR
  const validados = todosResultadosBrutos.filter((prop) => {
    const ementa = prop.ementa || '';
    const tipoValido = tiposAceitos.includes(prop.siglaTipo);
    
    if (!tipoValido) return false;

    const temRelevancia = RELEX_KEYWORDS.some((regex) => regex.test(ementa));
    const temExclusao = EXCLUSION_KEYWORDS.some((regex) => regex.test(ementa));

    // Se tem palavra de exclusão (ex: transporte) MAS também tem termo de relevância (ex: nome social), mantém!
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