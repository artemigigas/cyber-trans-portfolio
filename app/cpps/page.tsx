'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Menu,
  X,
  Play,
  Pause,
  MonitorPlay,
  Home,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Upload,
  MapPin,
  Camera,
  Sparkles,
  Film,
  Users
} from 'lucide-react';

/**
 * ============================================================================
 * TIPAGEM TYPESCRIPT
 * ============================================================================
 */
interface PhotoItem {
  title: string;
  territory: string;
  date: string;
  description: string;
  credits: string;
  motif?: string;
  imageUrl?: string;
}

interface Policy {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  color: string;
  accent: string;
  pattern: 'ankara' | 'cartography' | 'grid' | 'prism';
  territoryDefault: string;
  directive: string;
  photos: PhotoItem[];
}

interface RoomObject {
  policyIndex: number;
  policy: Policy;
  center: THREE.Vector3;
  group: THREE.Group;
  floorMesh: THREE.Mesh;
  light: THREE.PointLight;
}

interface VisitorAgent {
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  mode: 'walk' | 'observe';
  roomIndex: number;
  nextRoomIndex: number;
  progress: number;
  speed: number;
  phase: number;
  basePos: THREE.Vector3;
  baseRotY: number;
  roleTitle: string;
  policy: Policy;
}

interface SceneObjectsState {
  scene: THREE.Scene | null;
  camera: THREE.OrthographicCamera | null;
  controls: OrbitControls | null;
  roomObjects: RoomObject[];
  artworkMeshes: THREE.Mesh[];
  walkwayStrips: THREE.Mesh[];
  visitorHitMeshes: THREE.Object3D[];
  screenPlane: THREE.Mesh | null;
  desiredTarget: THREE.Vector3;
  desiredCameraPos: THREE.Vector3;
  desiredZoom: number;
  isTransitioning: boolean;
  addFrameToRoom: ((policyIdx: number, policyObj: Policy, photoObj: PhotoItem, slotIdx: number) => void) | null;
}

/**
 * ============================================================================
 * DADOS DAS 17 POLÍTICAS PÚBLICAS DE SAÚDE (CPPS / DAPS / SMS PORTO ALEGRE)
 * ============================================================================
 */
const INITIAL_POLICIES: Policy[] = [
  {
    id: 'pop-negra',
    number: '01',
    title: 'Saúde da População Negra',
    shortTitle: 'População Negra',
    color: '#d97706',
    accent: '#fbbf24',
    pattern: 'ankara',
    territoryDefault: 'GD Partenon / Lomba do Pinheiro',
    directive: 'Enfrentamento ao racismo institucional, cuidado integral às doenças prevalentes e valorização dos saberes de matriz africana.',
    photos: [
      {
        title: 'Roda de Cuidado e Saberes de Terreiro',
        territory: 'Gerência Distrital Lomba do Pinheiro',
        date: 'Novembro • Porto Alegre/RS',
        description: 'Ação integrada entre equipes de Atenção Primária e lideranças de matriz africana promovendo acolhimento e prevenção.',
        credits: 'Acervo CPPS / SMS Porto Alegre',
        motif: 'sunburst'
      },
      {
        title: 'Equidade Racial na Atenção Primária',
        territory: 'US Vila Cruzeiro / GD Glória-Cruzeiro-Cristal',
        date: 'Porto Alegre/RS',
        description: 'Qualificação do quesito raça/cor e monitoramento de indicadores de saúde materna e infantil.',
        credits: 'Equipe Técnica CPPS',
        motif: 'river'
      }
    ]
  },
  {
    id: 'pop-rua',
    number: '02',
    title: 'Saúde da População em Situação de Rua',
    shortTitle: 'Consultório na Rua',
    color: '#0284c7',
    accent: '#38bdf8',
    pattern: 'cartography',
    territoryDefault: 'GD Centro / Navegantes / Humaitá',
    directive: 'Acesso sem barreiras através das equipes de Consultório na Rua (eCR), redução de danos e articulação intersetorial.',
    photos: [
      {
        title: 'Itinerário do Consultório na Rua no Centro Histórico',
        territory: 'Gerência Distrital Centro',
        date: 'Porto Alegre/RS',
        description: 'Atendimento multiprofissional in loco, testagem rápida, vacinação e vinculação à rede de cuidados.',
        credits: 'Equipes eCR / DAPS POA',
        motif: 'river'
      },
      {
        title: 'Acolhimento e Redução de Danos',
        territory: 'Orla do Guaíba / Centro',
        date: 'Porto Alegre/RS',
        description: 'Escuta qualificada e garantia de direitos sociais e sanitários para pessoas em situação de rua.',
        credits: 'Acervo CPPS POA',
        motif: 'sunburst'
      }
    ]
  },
  {
    id: 'saude-homem',
    number: '03',
    title: 'Saúde do Homem',
    shortTitle: 'Saúde do Homem',
    color: '#2563eb',
    accent: '#60a5fa',
    pattern: 'grid',
    territoryDefault: 'GD Norte / Eixo Baltazar',
    directive: 'Ampliação do acesso aos serviços de saúde, pré-natal do parceiro, prevenção de agravos crônicos e paternidade ativa.',
    photos: [
      {
        title: 'Pré-Natal do Parceiro nas Unidades de Saúde',
        territory: 'GD Norte / Eixo Baltazar',
        date: 'Porto Alegre/RS',
        description: 'Incentivo à participação ativa dos homens no acompanhamento gestacional e autocuidado.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'sunburst'
      },
      {
        title: 'Ação Territorial nos Espaços de Trabalho',
        territory: 'GD Noroeste / Humaitá',
        date: 'Porto Alegre/RS',
        description: 'Busca ativa e educação em saúde voltada aos trabalhadores urbanos.',
        credits: 'APS Porto Alegre',
        motif: 'circles'
      }
    ]
  },
  {
    id: 'saude-lgbt',
    number: '04',
    title: 'Saúde da População LGBTQIAPN+',
    shortTitle: 'Saúde LGBTQIAPN+',
    color: '#9333ea',
    accent: '#e879f9',
    pattern: 'prism',
    territoryDefault: 'Ambulatório Trans / GD Centro',
    directive: 'Respeito ao nome social, acolhimento livre de discriminação e cuidado integral nos ambulatórios e unidades básicas.',
    photos: [
      {
        title: 'Acolhimento Integral e Respeito à Diversidade',
        territory: 'GD Centro / Ambulatório Especializado',
        date: 'Porto Alegre/RS',
        description: 'Formação permanente das equipes de saúde para atendimento humanizado da população LGBTQIAPN+.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'prism'
      },
      {
        title: 'Visibilidade e Cuidado no Território',
        territory: 'Parque Farroupilha / Centro',
        date: 'Porto Alegre/RS',
        description: 'Tenda de prevenção combinada, orientação em saúde e promoção de cidadania.',
        credits: 'Equipe CPPS POA',
        motif: 'sunburst'
      }
    ]
  },
  {
    id: 'saude-ppl',
    number: '05',
    title: 'Saúde da População Privada de Liberdade (PPL)',
    shortTitle: 'Saúde PPL / PNAISP',
    color: '#475569',
    accent: '#94a3b8',
    pattern: 'grid',
    territoryDefault: 'Equipes PNAISP / Unidades Prisionais POA',
    directive: 'Garantia do direito constitucional à saúde no sistema prisional por meio das equipes de Atenção Primária Prisional.',
    photos: [
      {
        title: 'Atenção Primária nas Unidades Prisionais',
        territory: 'Complexo Prisional / Porto Alegre',
        date: 'Porto Alegre/RS',
        description: 'Rastreamento de tuberculose, saúde mental e acompanhamento clínico contínuo.',
        credits: 'Equipes PNAISP / SMS POA',
        motif: 'circles'
      },
      {
        title: 'Articulação de Rede e Saída Segura',
        territory: 'Rede Intersetorial POA',
        date: 'Porto Alegre/RS',
        description: 'Continuidade do cuidado na transição para as Unidades de Saúde de referência nos bairros.',
        credits: 'Acervo CPPS POA',
        motif: 'river'
      }
    ]
  },
  {
    id: 'saude-indigena',
    number: '06',
    title: 'Saúde Indígena',
    shortTitle: 'Saúde Indígena',
    color: '#b45309',
    accent: '#f59e0b',
    pattern: 'ankara',
    territoryDefault: 'Aldeias Mbyá-Guarani, Kaingang e Charrua',
    directive: 'Atenção diferenciada respeitando a interculturalidade, medicinas tradicionais e territórios indígenas de Porto Alegre.',
    photos: [
      {
        title: 'Cuidado Intercultural nas Aldeias de Porto Alegre',
        territory: 'Lomba do Pinheiro / Ponta do Arado / Morro Santana',
        date: 'Porto Alegre/RS',
        description: 'Diálogo entre equipes multiprofissionais e lideranças espirituais indígenas.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'sunburst'
      },
      {
        title: 'Soberania Alimentar e Plantas Medicinais',
        territory: 'Tekoa / Porto Alegre',
        date: 'Porto Alegre/RS',
        description: 'Valorização das hortas tradicionais e cuidado materno-infantil nas comunidades.',
        credits: 'Equipe Saúde Indígena POA',
        motif: 'river'
      }
    ]
  },
  {
    id: 'dants',
    number: '07',
    title: 'DANTS e Promoção da Saúde',
    shortTitle: 'DANTS',
    color: '#0d9488',
    accent: '#2dd4bf',
    pattern: 'cartography',
    territoryDefault: 'Todas as 8 Gerências Distritais',
    directive: 'Prevenção e controle das Doenças e Agravos Não Transmissíveis, estímulo à atividade física e ambientes saudáveis.',
    photos: [
      {
        title: 'Grupos de Caminhada e Práticas Corporais',
        territory: 'GD Restinga / Extremo Sul',
        date: 'Porto Alegre/RS',
        description: 'Promoção da saúde cardiovascular e convivência comunitária nas praças dos bairros.',
        credits: 'Academias da Saúde / SMS POA',
        motif: 'river'
      },
      {
        title: 'Monitoramento e Cuidado às Condições Crônicas',
        territory: 'GD Leste / Nordeste',
        date: 'Porto Alegre/RS',
        description: 'Linha de cuidado integrada para hipertensão e diabetes na Atenção Primária.',
        credits: 'Acervo CPPS POA',
        motif: 'circles'
      }
    ]
  },
  {
    id: 'saude-mulher',
    number: '08',
    title: 'Saúde da Mulher',
    shortTitle: 'Saúde da Mulher',
    color: '#db2777',
    accent: '#f472b6',
    pattern: 'ankara',
    territoryDefault: 'Rede Materno-Infantil / Todas as GDs',
    directive: 'Atenção integral em todas as fases da vida, planejamento reprodutivo, pré-natal qualificado e prevenção do câncer.',
    photos: [
      {
        title: 'Rodas de Gestantes e Vínculo Materno',
        territory: 'GD Sul / Centro-Sul',
        date: 'Porto Alegre/RS',
        description: 'Preparação para o parto humanizado, aleitamento materno e fortalecimento da rede de apoio.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'sunburst'
      },
      {
        title: 'Prevenção e Diagnóstico Precoce',
        territory: 'Unidades de Saúde POA',
        date: 'Outubro Rosa • Porto Alegre/RS',
        description: 'Acesso ampliado ao rastreamento do câncer de mama e colo do útero nos territórios.',
        credits: 'APS Porto Alegre',
        motif: 'circles'
      }
    ]
  },
  {
    id: 'saude-pcd',
    number: '09',
    title: 'Saúde da Pessoa com Deficiência (PCD)',
    shortTitle: 'Saúde PCD',
    color: '#0369a1',
    accent: '#38bdf8',
    pattern: 'prism',
    territoryDefault: 'Rede de Cuidados à Pessoa com Deficiência',
    directive: 'Acessibilidade comunicacional e arquitetônica, reabilitação e inclusão social plena nos serviços de saúde.',
    photos: [
      {
        title: 'Acolhimento Acessível e Comunicação Inclusiva',
        territory: 'GD Glória / Cruzeiro / Cristal',
        date: 'Porto Alegre/RS',
        description: 'Capacitação de equipes em Libras e fluxos prioritários na Atenção Primária.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'prism'
      },
      {
        title: 'Cuidado Domiciliar e Tecnologia Assistiva',
        territory: 'GD Partenon',
        date: 'Porto Alegre/RS',
        description: 'Articulação entre Unidades de Saúde e serviços especializados de reabilitação.',
        credits: 'Equipe CPPS POA',
        motif: 'circles'
      }
    ]
  },
  {
    id: 'saude-imigrantes',
    number: '10',
    title: 'Saúde dos Imigrantes, Refugiados e Apátridas',
    shortTitle: 'Imigrantes e Refugiados',
    color: '#059669',
    accent: '#34d399',
    pattern: 'cartography',
    territoryDefault: 'GD Norte / Sarandi / Centro',
    directive: 'Garantia de acesso universal ao SUS independente de situação documental, com mediação cultural e linguística.',
    photos: [
      {
        title: 'Cartilhas Multilíngues e Acolhimento Sem Fronteiras',
        territory: 'GD Norte / Eixo Baltazar',
        date: 'Porto Alegre/RS',
        description: 'Materiais em espanhol, crioulo haitiano, francês e inglês facilitando o acesso às Unidades de Saúde.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'river'
      },
      {
        title: 'Mutirão de Vacinação e Cidadania',
        territory: 'Zona Norte • Porto Alegre/RS',
        date: 'Porto Alegre/RS',
        description: 'Integração entre saúde, assistência social e associações de migrantes.',
        credits: 'APS Porto Alegre',
        motif: 'sunburst'
      }
    ]
  },
  {
    id: 'pessoa-idosa',
    number: '11',
    title: 'Saúde da Pessoa Idosa',
    shortTitle: 'Pessoa Idosa',
    color: '#ca8a04',
    accent: '#facc15',
    pattern: 'ankara',
    territoryDefault: 'Todas as Gerências Distritais',
    directive: 'Envelhecimento ativo e saudável, avaliação multidimensional da pessoa idosa e suporte às ILPIs.',
    photos: [
      {
        title: 'Grupos de Convivência e Memória Ativa',
        territory: 'GD Centro / Cidade Baixa',
        date: 'Porto Alegre/RS',
        description: 'Atividades de estímulo cognitivo, prevenção de quedas e fortalecimento de vínculos comunitários.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'sunburst'
      },
      {
        title: 'Cuidado Integral nas Instituições de Longa Permanência',
        territory: 'Rede Intersetorial POA',
        date: 'Porto Alegre/RS',
        description: 'Acompanhamento matricial das equipes de Atenção Primária junto às ILPIs.',
        credits: 'Equipe CPPS POA',
        motif: 'circles'
      }
    ]
  },
  {
    id: 'saude-crianca',
    number: '12',
    title: 'Saúde da Criança',
    shortTitle: 'Saúde da Criança',
    color: '#ea580c',
    accent: '#fb923c',
    pattern: 'prism',
    territoryDefault: 'Primeira Infância Melhor / Todas as GDs',
    directive: 'Puericultura, incentivo ao aleitamento materno, cobertura vacinal e desenvolvimento integral na primeira infância.',
    photos: [
      {
        title: 'Acompanhamento do Crescimento e Desenvolvimento',
        territory: 'GD Restinga / Extremo Sul',
        date: 'Porto Alegre/RS',
        description: 'Consultas compartilhadas de puericultura e orientação lúdica às famílias.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'sunburst'
      },
      {
        title: 'Hora do Mamaço e Apoio à Amamentação',
        territory: 'GD Leste / Nordeste',
        date: 'Agosto Dourado • Porto Alegre/RS',
        description: 'Mobilização comunitária pelo aleitamento materno exclusivo até os seis meses.',
        credits: 'APS Porto Alegre',
        motif: 'circles'
      }
    ]
  },
  {
    id: 'adolescente-jovem',
    number: '13',
    title: 'Saúde do Adolescente e Jovem',
    shortTitle: 'Adolescente e Jovem',
    color: '#4f46e5',
    accent: '#818cf8',
    pattern: 'prism',
    territoryDefault: 'Programa Saúde na Escola (PSE)',
    directive: 'Protagonismo juvenil, saúde sexual e reprodutiva, prevenção às violências e articulação com as escolas públicas.',
    photos: [
      {
        title: 'Diálogos na Escola: Saúde e Projeto de Vida',
        territory: 'Escolas Municipais e Estaduais • POA',
        date: 'Porto Alegre/RS',
        description: 'Oficinas participativas conduzidas pelas equipes de saúde dentro do Programa Saúde na Escola.',
        credits: 'PSE / CPPS Porto Alegre',
        motif: 'prism'
      },
      {
        title: 'Acolhimento Jovem nas Unidades Básicas',
        territory: 'GD Partenon / Lomba do Pinheiro',
        date: 'Porto Alegre/RS',
        description: 'Escuta sigilosa e sem julgamentos para adolescentes nos territórios.',
        credits: 'Acervo CPPS POA',
        motif: 'sunburst'
      }
    ]
  },
  {
    id: 'saude-mental',
    number: '14',
    title: 'Saúde Mental na Atenção Primária (RAPS)',
    shortTitle: 'Saúde Mental / RAPS',
    color: '#0891b2',
    accent: '#22d3ee',
    pattern: 'cartography',
    territoryDefault: 'Matriciamento RAPS / e-Multi',
    directive: 'Cuidado em liberdade, apoio matricial entre CAPS e Unidades de Saúde, e grupos terapêuticos comunitários.',
    photos: [
      {
        title: 'Terapia Comunitária e Rodas de Escuta',
        territory: 'GD Sul / Centro-Sul',
        date: 'Porto Alegre/RS',
        description: 'Espaços coletivos de acolhimento ao sofrimento psíquico e fortalecimento de redes solidárias.',
        credits: 'Acervo CPPS / RAPS POA',
        motif: 'river'
      },
      {
        title: 'Cuidado em Liberdade e Economia Solidária',
        territory: 'GD Centro / Glória',
        date: 'Porto Alegre/RS',
        description: 'Oficinas de arte, geração de renda e protagonismo dos usuários da RAPS.',
        credits: 'SMS Porto Alegre',
        motif: 'circles'
      }
    ]
  },
  {
    id: 'pics',
    number: '15',
    title: 'Práticas Integrativas e Complementares (PICS)',
    shortTitle: 'PICS',
    color: '#16a34a',
    accent: '#4ade80',
    pattern: 'ankara',
    territoryDefault: 'Hortos Medicinais e Unidades de Saúde',
    directive: 'Fitoterapia, auriculoterapia, meditação, yoga e hortas comunitárias ampliando os recursos terapêuticos do SUS.',
    photos: [
      {
        title: 'Horto Medicinal Comunitário e Fitoterapia',
        territory: 'GD Lomba do Pinheiro / Agronomia',
        date: 'Porto Alegre/RS',
        description: 'Cultivo compartilhado de plantas medicinais e educação popular em saúde.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'sunburst'
      },
      {
        title: 'Auriculoterapia e Cuidado ao Trabalhador',
        territory: 'Unidades de Saúde POA',
        date: 'Porto Alegre/RS',
        description: 'Oferta de práticas integrativas para usuários e equipes da Atenção Primária.',
        credits: 'Rede PICS POA',
        motif: 'circles'
      }
    ]
  },
  {
    id: 'alimentacao-nutricao',
    number: '16',
    title: 'Alimentação e Nutrição (PNAN / SISVAN)',
    shortTitle: 'Alimentação e Nutrição',
    color: '#65a30d',
    accent: '#a3e635',
    pattern: 'cartography',
    territoryDefault: 'Cozinhas Comunitárias e Unidades de Saúde',
    directive: 'Promoção da alimentação adequada e saudável, vigilância nutricional e combate à insegurança alimentar.',
    photos: [
      {
        title: 'Oficinas Culinárias e Aproveitamento Integral',
        territory: 'GD Nordeste / Mario Quintana',
        date: 'Porto Alegre/RS',
        description: 'Educação alimentar e nutricional valorizando alimentos in natura e regionais.',
        credits: 'Acervo CPPS / e-Multi POA',
        motif: 'sunburst'
      },
      {
        title: 'Vigilância Alimentar e Nutricional no Território',
        territory: 'Todas as Gerências Distritais',
        date: 'Porto Alegre/RS',
        description: 'Acompanhamento nutricional desde a gestação até a pessoa idosa.',
        credits: 'SMS Porto Alegre',
        motif: 'river'
      }
    ]
  },
  {
    id: 'controle-tabaco',
    number: '17',
    title: 'Controle do Tabagismo e Prevenção às Violências',
    shortTitle: 'Tabagismo e Cultura de Paz',
    color: '#e11d48',
    accent: '#fb7185',
    pattern: 'grid',
    territoryDefault: 'Grupos de Cessação / Rede de Proteção',
    directive: 'Grupos de apoio para cessação do tabagismo, vigilância de violências e promoção da cultura de paz nos territórios.',
    photos: [
      {
        title: 'Grupos de Apoio para Parar de Fumar',
        territory: 'Unidades de Saúde • Porto Alegre/RS',
        date: 'Porto Alegre/RS',
        description: 'Abordagem cognitivo-comportamental e acompanhamento multiprofissional gratuito pelo SUS.',
        credits: 'Acervo CPPS / SMS POA',
        motif: 'circles'
      },
      {
        title: 'Rede de Cuidado e Cultura de Paz',
        territory: 'GD Cruzeiro / Cristal',
        date: 'Porto Alegre/RS',
        description: 'Articulação territorial para prevenção de violências e proteção integral.',
        credits: 'SMS Porto Alegre',
        motif: 'prism'
      }
    ]
  }
];

const GRID_SLOTS: [number, number][] = [
  [-2, -1.5], [-1, -1.5], [0, -1.5], [1, -1.5], [2, -1.5],
  [2, -0.5], [2, 0.5], [1.5, 1.5], [0.5, 1.5],
  [-0.5, 1.5], [-1.5, 1.5], [-2, 0.5], [-2, -0.5],
  [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5]
];

const SKIN_TONES = ['#4a2e1b', '#6b4226', '#8d5524', '#c68642', '#e0ac69', '#f1c27d'];
const HAIR_COLORS = ['#18120e', '#2c1e16', '#4a3222', '#7c2d12', '#d6d3d1'];
const TECHNICAL_ROLES = [
  'Referência Técnica • CPPS',
  'Articuladora Territorial • DAPS',
  'Sanitarista • Gestão em Saúde',
  'Equipe Multiprofissional • SUS POA',
  'Apoio Matricial • Atenção Primária'
];

/**
 * ============================================================================
 * FUNÇÕES GERADORAS DE TEXTURAS PROCEDURAIS (CANVAS 2D)
 * ============================================================================
 */
function createFloorTexture(policy: Policy): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#efe5d4';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(120, 90, 60, 0.035)' : 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  ctx.save();
  ctx.strokeStyle = policy.color;
  ctx.lineWidth = 18;
  ctx.strokeRect(24, 24, 464, 464);

  ctx.strokeStyle = policy.accent;
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 10]);
  ctx.strokeRect(46, 46, 420, 420);
  ctx.restore();

  ctx.save();
  ctx.translate(256, 256);
  ctx.strokeStyle = policy.color;
  ctx.fillStyle = policy.color;
  ctx.globalAlpha = 0.14;

  if (policy.pattern === 'ankara') {
    for (let r = 40; r <= 160; r += 40) {
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let a = 0; a < 12; a++) {
      ctx.rotate(Math.PI / 6);
      ctx.fillRect(-6, 55, 12, 95);
    }
  } else if (policy.pattern === 'cartography') {
    ctx.lineWidth = 4;
    for (let i = -140; i <= 140; i += 35) {
      ctx.beginPath();
      ctx.moveTo(-160, i);
      ctx.bezierCurveTo(-50, i - 30, 50, i + 30, 160, i);
      ctx.stroke();
    }
  } else if (policy.pattern === 'prism') {
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(130, -45);
      ctx.lineTo(130, 45);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    ctx.lineWidth = 3;
    for (let x = -140; x <= 140; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, -140);
      ctx.lineTo(x, 140);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-140, x);
      ctx.lineTo(140, x);
      ctx.stroke();
    }
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = policy.color;
  ctx.globalAlpha = 0.24;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(policy.number, 455, 448);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createRoomSignTexture(policy: Policy): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#241b15';
  ctx.fillRect(0, 0, 768, 160);

  ctx.fillStyle = policy.color;
  ctx.fillRect(0, 0, 118, 160);

  ctx.strokeStyle = 'rgba(247, 239, 228, 0.28)';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 762, 154);

  ctx.fillStyle = '#1c140e';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(policy.number, 59, 82);

  ctx.fillStyle = '#f7efe4';
  ctx.textAlign = 'left';
  ctx.font = 'bold 30px sans-serif';

  const words = policy.title.split(' ');
  let line1 = '';
  let line2 = '';
  for (const w of words) {
    if ((line1 + w).length <= 27) {
      line1 += (line1 ? ' ' : '') + w;
    } else {
      line2 += (line2 ? ' ' : '') + w;
    }
  }

  if (line2) {
    ctx.fillText(line1, 142, 58);
    ctx.fillStyle = policy.accent;
    ctx.font = '600 25px sans-serif';
    ctx.fillText(line2, 142, 106);
  } else {
    ctx.fillText(line1, 142, 82);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateArtworkDataURL(policy: Policy, photo: Partial<PhotoItem>, index: number): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 640, 480);
  grad.addColorStop(0, '#231a14');
  grad.addColorStop(0.55, policy.color);
  grad.addColorStop(1, '#1a1410');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = policy.accent;
  ctx.strokeStyle = '#fff8ee';
  ctx.lineWidth = 3;

  if (photo.motif === 'sunburst' || index === 0) {
    ctx.beginPath();
    ctx.arc(320, 215, 110, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 16; i++) {
      const ang = (i * Math.PI) / 8;
      ctx.beginPath();
      ctx.moveTo(320 + Math.cos(ang) * 125, 215 + Math.sin(ang) * 125);
      ctx.lineTo(320 + Math.cos(ang) * 185, 215 + Math.sin(ang) * 185);
      ctx.stroke();
    }
  } else if (photo.motif === 'river' || index === 1) {
    for (let y = 110; y <= 310; y += 34) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.bezierCurveTo(200, y - 45, 440, y + 45, 600, y);
      ctx.stroke();
    }
  } else {
    for (let r = 45; r <= 165; r += 40) {
      ctx.beginPath();
      ctx.arc(320, 210, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  ctx.fillStyle = 'rgba(20, 15, 12, 0.75)';
  ctx.fillRect(0, 330, 640, 150);

  ctx.strokeStyle = 'rgba(255, 244, 228, 0.55)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 600, 440);

  ctx.fillStyle = policy.accent;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`CPPS POA • ${policy.shortTitle.toUpperCase()}`, 42, 372);

  ctx.fillStyle = '#fdf8f0';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText((photo.title || 'Registro CPPS').slice(0, 38), 42, 408);

  ctx.fillStyle = '#d6c5b3';
  ctx.font = '15px sans-serif';
  ctx.fillText(`📍 ${photo.territory || policy.territoryDefault}`, 42, 436);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * ============================================================================
 * CONSTRUTOR DE PERSONAGEM 3D (EQUIPES TÉCNICAS & VISITANTES DO PAVILHÃO)
 * ============================================================================
 */
function buildTechnicalPersonMesh(seed: number, policy: Policy, hasClipboard: boolean) {
  const personGroup = new THREE.Group();

  const skinColor = SKIN_TONES[seed % SKIN_TONES.length];
  const hairColor = HAIR_COLORS[(seed * 3) % HAIR_COLORS.length];
  const isWhiteCoat = seed % 3 === 0;
  const topColor = isWhiteCoat ? '#f5f0e6' : seed % 2 === 0 ? policy.color : '#292524';
  const pantsColor = seed % 2 === 0 ? '#1e293b' : '#3f2e21';

  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.85 });
  const topMat = new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.65 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
  const accentMat = new THREE.MeshStandardMaterial({ color: policy.accent, roughness: 0.4 });

  // Sombra de contato no piso
  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 16),
    new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28 })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.02;
  personGroup.add(shadowDisc);

  // Pernas
  const legGeo = new THREE.BoxGeometry(0.13, 0.56, 0.14);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.1, 0.28, 0);
  leftLeg.castShadow = true;
  personGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.1, 0.28, 0);
  rightLeg.castShadow = true;
  personGroup.add(rightLeg);

  // Tronco
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.54, 0.22), topMat);
  torso.position.set(0, 0.82, 0);
  torso.castShadow = true;
  personGroup.add(torso);

  // Crachá / Cordão Institucional SUS
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.03), accentMat);
  badge.position.set(0.09, 0.9, 0.12);
  personGroup.add(badge);

  // Cabeça
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMat);
  head.position.set(0, 1.26, 0);
  head.castShadow = true;
  personGroup.add(head);

  // Penteados variados (Black power / Coque / Corte clássico)
  const hairStyle = seed % 3;
  if (hairStyle === 0) {
    const afroHair = new THREE.Mesh(new THREE.SphereGeometry(0.195, 16, 16), hairMat);
    afroHair.position.set(0, 1.31, -0.02);
    afroHair.castShadow = true;
    personGroup.add(afroHair);
  } else if (hairStyle === 1) {
    const capHair = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 14), hairMat);
    capHair.position.set(0, 1.28, -0.02);
    personGroup.add(capHair);

    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), hairMat);
    bun.position.set(0, 1.43, -0.11);
    personGroup.add(bun);
  } else {
    const shortHair = new THREE.Mesh(new THREE.SphereGeometry(0.168, 14, 14), hairMat);
    shortHair.position.set(0, 1.29, -0.015);
    personGroup.add(shortHair);
  }

  // Braços
  const armGeo = new THREE.BoxGeometry(0.11, 0.46, 0.11);
  const leftArm = new THREE.Mesh(armGeo, topMat);
  leftArm.position.set(-0.26, 0.82, 0);
  leftArm.castShadow = true;
  personGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, topMat);
  rightArm.position.set(0.26, 0.82, 0);
  rightArm.castShadow = true;
  personGroup.add(rightArm);

  // Prancheta técnica de campo
  if (hasClipboard) {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.03, 0.26),
      new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.5 })
    );
    board.position.set(0.24, 0.68, 0.16);
    board.rotation.x = 0.25;
    rightArm.rotation.x = -0.55;
    personGroup.add(board);
  }

  // Hitbox invisível para facilitar o hover e clique no personagem
  const hitBox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 1.55, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitBox.position.y = 0.78;
  personGroup.add(hitBox);

  return { personGroup, leftLeg, rightLeg, leftArm, rightArm, hitBox };
}

/**
 * ============================================================================
 * COMPONENTE PRINCIPAL: PAVILHÃO CPPS 3D ISOMÉTRICO
 * ============================================================================
 */
export default function PavilhaoCPPSPage() {
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isAutoTour, setIsAutoTour] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);
  const [tourSpeedMs, setTourSpeedMs] = useState<number>(5500);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showVisitors, setShowVisitors] = useState<boolean>(true);

  const [selectedArtwork, setSelectedArtwork] = useState<{ policy: Policy; photo: PhotoItem } | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [customMp4Url, setCustomMp4Url] = useState<string | null>(null);
  const [curatorModalOpen, setCuratorModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    tag: '',
    title: '',
    sub: '',
    color: '#fbbf24'
  });

  const [formPolicyIdx, setFormPolicyIdx] = useState<number>(0);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formTerritory, setFormTerritory] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formCredits, setFormCredits] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formFileDataUrl, setFormFileDataUrl] = useState<string | null>(null);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const visitorsGroupRef = useRef<THREE.Group | null>(null);
  const sceneObjectsRef = useRef<SceneObjectsState>({
    scene: null,
    camera: null,
    controls: null,
    roomObjects: [],
    artworkMeshes: [],
    walkwayStrips: [],
    visitorHitMeshes: [],
    screenPlane: null,
    desiredTarget: new THREE.Vector3(0, 0, 0),
    desiredCameraPos: new THREE.Vector3(56, 48, 56),
    desiredZoom: 0.88,
    isTransitioning: false,
    addFrameToRoom: null
  });

  // Hidratação segura no cliente (evita erro SSR de document/window)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    setPolicies((prev) =>
      prev.map((pol) => ({
        ...pol,
        photos: pol.photos.map((ph, idx) => ({
          ...ph,
          imageUrl: ph.imageUrl || generateArtworkDataURL(pol, ph, idx)
        }))
      }))
    );
  }, []);

  // Alterna visibilidade das equipes técnicas 3D
  useEffect(() => {
    if (visitorsGroupRef.current) {
      visitorsGroupRef.current.visible = showVisitors;
    }
  }, [showVisitors]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3400);
  }, []);

  const totalWorksCount = useMemo(
    () => policies.reduce((sum, p) => sum + p.photos.length, 0),
    [policies]
  );

  const filteredPolicies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return policies.map((p, idx) => ({ ...p, originalIndex: idx }));
    return policies
      .map((p, idx) => ({ ...p, originalIndex: idx }))
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.territoryDefault.toLowerCase().includes(q) ||
          p.number.includes(q)
      );
  }, [policies, searchQuery]);

  const focusAerial = useCallback((keepTour = false) => {
    if (!keepTour) setIsAutoTour(false);
    setActiveIndex(-1);
    const st = sceneObjectsRef.current;
    st.desiredTarget.set(0, 0, 0);
    st.desiredCameraPos.set(56, 48, 56);
    st.desiredZoom = typeof window !== 'undefined' && window.innerWidth < 640 ? 0.58 : 0.88;
    st.isTransitioning = true;
    st.roomObjects.forEach((r) => {
      if (r.light) r.light.intensity = 0.42;
    });
  }, []);

  const focusCentralPlaza = useCallback((keepTour = false) => {
    if (!keepTour) setIsAutoTour(false);
    setActiveIndex(-2);
    const st = sceneObjectsRef.current;
    st.desiredTarget.set(0, 2.2, 0);
    st.desiredCameraPos.set(18, 15, 18);
    st.desiredZoom = typeof window !== 'undefined' && window.innerWidth < 640 ? 1.85 : 2.55;
    st.isTransitioning = true;
    st.roomObjects.forEach((r) => {
      if (r.light) r.light.intensity = 0.35;
    });
  }, []);

  const focusRoom = useCallback((idx: number, keepTour = false) => {
    if (!keepTour) setIsAutoTour(false);
    const st = sceneObjectsRef.current;
    const room = st.roomObjects[idx];
    if (!room) return;

    setActiveIndex(idx);
    st.desiredTarget.set(room.center.x - 0.6, 1.2, room.center.z - 0.6);
    st.desiredCameraPos.copy(st.desiredTarget).add(new THREE.Vector3(24, 21, 24));
    st.desiredZoom = typeof window !== 'undefined' && window.innerWidth < 640 ? 1.75 : 2.35;
    st.isTransitioning = true;

    st.roomObjects.forEach((r, i) => {
      if (r.light) r.light.intensity = i === idx ? 0.95 : 0.32;
    });
  }, []);

  const focusRoomRef = useRef(focusRoom);
  useEffect(() => {
    focusRoomRef.current = focusRoom;
  }, [focusRoom]);

  useEffect(() => {
    if (!isAutoTour) return;

    const totalSteps = policies.length + 2;
    const runStep = (stepVal: number) => {
      const norm = ((stepVal % totalSteps) + totalSteps) % totalSteps;
      if (norm === 0) focusAerial(true);
      else if (norm === 1) focusCentralPlaza(true);
      else focusRoom(norm - 2, true);
    };

    runStep(tourStep);

    const timer = setInterval(() => {
      setTourStep((prev) => {
        const next = (prev + 1) % totalSteps;
        runStep(next);
        return next;
      });
    }, tourSpeedMs);

    return () => clearInterval(timer);
  }, [isAutoTour, tourSpeedMs, policies.length, focusAerial, focusCentralPlaza, focusRoom]);

  const handleToggleTour = () => {
    if (isAutoTour) {
      setIsAutoTour(false);
      showToast('⏸️ Tour automático pausado. Controle manual ativo.');
    } else {
      const initialStep = activeIndex >= 0 ? activeIndex + 2 : 0;
      setTourStep(initialStep);
      setIsAutoTour(true);
      showToast('🎬 Passeio guiado pelas 17 políticas iniciado!');
    }
  };

  /**
   * ============================================================================
   * INICIALIZAÇÃO DO MUNDO 3D ISOMÉTRICO (THREE.JS + ORBITCONTROLS + AGENTES)
   * ============================================================================
   */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1c1713');
    scene.fog = new THREE.FogExp2('#1c1713', 0.0045);

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 56;
    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      1,
      400
    );

    camera.position.set(56, 48, 56);
    camera.lookAt(0, 0, 0);
    camera.zoom = window.innerWidth < 640 ? 0.62 : 0.88;
    camera.updateProjectionMatrix();

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minZoom = 0.45;
    controls.maxZoom = 3.6;
    controls.maxPolarAngle = Math.PI / 2.25;
    controls.minPolarAngle = 0.25;
    controls.screenSpacePanning = true;

    controls.addEventListener('start', () => {
      sceneObjectsRef.current.isTransitioning = false;
      setIsAutoTour(false);
    });

    const ambientLight = new THREE.AmbientLight('#f7e8d4', 0.68);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#fff1dc', 0.78);
    dirLight.position.set(42, 68, 34);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 180;
    const dShadow = 58;
    dirLight.shadow.camera.left = -dShadow;
    dirLight.shadow.camera.right = dShadow;
    dirLight.shadow.camera.top = dShadow;
    dirLight.shadow.camera.bottom = -dShadow;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight('#9ec5d6', 0.28);
    fillLight.position.set(-45, 30, -40);
    scene.add(fillLight);

    const groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      new THREE.MeshStandardMaterial({ color: '#241d18', roughness: 0.92, metalness: 0.05 })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.05;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    const gridHelper = new THREE.GridHelper(160, 40, '#4a3b2c', '#2e251e');
    gridHelper.position.y = -0.02;
    scene.add(gridHelper);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: '#e6dac8', roughness: 0.85, metalness: 0.02 });
    const woodTrimMaterial = new THREE.MeshStandardMaterial({ color: '#3a281c', roughness: 0.6, metalness: 0.1 });
    const goldFrameMaterial = new THREE.MeshStandardMaterial({ color: '#c98e3a', roughness: 0.35, metalness: 0.65 });

    const ROOM_SIZE = 10.2;
    const ROOM_SPACING = 12.2;
    const WALL_HEIGHT = 3.6;
    const WALL_THICK = 0.34;
    const PORTAL_WIDTH = 3.4;

    const roomObjects: RoomObject[] = [];
    const artworkMeshes: THREE.Mesh[] = [];
    const walkwayStrips: THREE.Mesh[] = [];

    function buildWallWithPortal(
      roomGroup: THREE.Group,
      orientation: 'horizontal' | 'vertical',
      offsetCoord: number,
      height: number,
      material: THREE.Material,
      addHeaderLintel = true
    ) {
      const sidePanelLen = (ROOM_SIZE - PORTAL_WIDTH) / 2;
      const lintelHeight = 0.72;

      if (orientation === 'horizontal') {
        const leftPier = new THREE.Mesh(new THREE.BoxGeometry(sidePanelLen, height, WALL_THICK), material);
        leftPier.position.set(-ROOM_SIZE / 2 + sidePanelLen / 2, height / 2 + 0.1, offsetCoord);
        leftPier.castShadow = true;
        leftPier.receiveShadow = true;
        roomGroup.add(leftPier);

        const rightPier = new THREE.Mesh(new THREE.BoxGeometry(sidePanelLen, height, WALL_THICK), material);
        rightPier.position.set(ROOM_SIZE / 2 - sidePanelLen / 2, height / 2 + 0.1, offsetCoord);
        rightPier.castShadow = true;
        rightPier.receiveShadow = true;
        roomGroup.add(rightPier);

        if (addHeaderLintel && height > 1.5) {
          const lintel = new THREE.Mesh(new THREE.BoxGeometry(PORTAL_WIDTH, lintelHeight, WALL_THICK), material);
          lintel.position.set(0, height - lintelHeight / 2 + 0.1, offsetCoord);
          lintel.castShadow = true;
          roomGroup.add(lintel);
        }
      } else {
        const topPier = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICK, height, sidePanelLen), material);
        topPier.position.set(offsetCoord, height / 2 + 0.1, -ROOM_SIZE / 2 + sidePanelLen / 2);
        topPier.castShadow = true;
        topPier.receiveShadow = true;
        roomGroup.add(topPier);

        const bottomPier = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICK, height, sidePanelLen), material);
        bottomPier.position.set(offsetCoord, height / 2 + 0.1, ROOM_SIZE / 2 - sidePanelLen / 2);
        bottomPier.castShadow = true;
        bottomPier.receiveShadow = true;
        roomGroup.add(bottomPier);

        if (addHeaderLintel && height > 1.5) {
          const lintel = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICK, lintelHeight, PORTAL_WIDTH), material);
          lintel.position.set(offsetCoord, height - lintelHeight / 2 + 0.1, 0);
          lintel.castShadow = true;
          roomGroup.add(lintel);
        }
      }
    }

    function createFramedArtwork(policy: Policy, photo: PhotoItem, slotIndex: number, roomGroup: THREE.Group) {
      const wallConfigs = [
        { pos: new THREE.Vector3(-ROOM_SIZE / 2 + 0.24, 1.88, -3.35), rotY: Math.PI / 2 },
        { pos: new THREE.Vector3(-3.35, 1.88, -ROOM_SIZE / 2 + 0.24), rotY: 0 },
        { pos: new THREE.Vector3(3.35, 1.88, -ROOM_SIZE / 2 + 0.24), rotY: 0 },
        { pos: new THREE.Vector3(-ROOM_SIZE / 2 + 0.24, 1.88, 3.35), rotY: Math.PI / 2 }
      ];

      const cfg = wallConfigs[slotIndex % wallConfigs.length];
      const frameGroup = new THREE.Group();
      frameGroup.position.copy(cfg.pos);
      frameGroup.rotation.y = cfg.rotY;

      const frameW = 2.35;
      const frameH = 1.78;
      const frameMesh = new THREE.Mesh(
        new THREE.BoxGeometry(frameW, frameH, 0.12),
        slotIndex % 2 === 0 ? woodTrimMaterial : goldFrameMaterial
      );
      frameMesh.castShadow = true;
      frameGroup.add(frameMesh);

      const matMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(frameW - 0.22, frameH - 0.22),
        new THREE.MeshBasicMaterial({ color: '#f5ede0' })
      );
      matMesh.position.z = 0.065;
      frameGroup.add(matMesh);

      const loader = new THREE.TextureLoader();
      const artUrl = photo.imageUrl || generateArtworkDataURL(policy, photo, slotIndex);
      const artTex = loader.load(artUrl);
      artTex.colorSpace = THREE.SRGBColorSpace;

      const artMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(frameW - 0.42, frameH - 0.42),
        new THREE.MeshBasicMaterial({ map: artTex })
      );
      artMesh.position.z = 0.072;
      artMesh.userData = { type: 'artwork', policy, photo: { ...photo, imageUrl: artUrl } };
      frameGroup.add(artMesh);
      artworkMeshes.push(artMesh);

      const lampMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.22), woodTrimMaterial);
      lampMesh.position.set(0, frameH / 2 + 0.35, 0.22);
      frameGroup.add(lampMesh);

      roomGroup.add(frameGroup);
    }

    INITIAL_POLICIES.forEach((policy, index) => {
      const [col, row] = GRID_SLOTS[index];
      const roomCenter = new THREE.Vector3(col * ROOM_SPACING, 0, row * ROOM_SPACING);

      const roomGroup = new THREE.Group();
      roomGroup.position.copy(roomCenter);

      const floorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(ROOM_SIZE, 0.16, ROOM_SIZE),
        new THREE.MeshStandardMaterial({
          map: createFloorTexture(policy),
          roughness: 0.78,
          metalness: 0.05
        })
      );
      floorMesh.position.y = 0.08;
      floorMesh.receiveShadow = true;
      floorMesh.userData = { type: 'room', policyIndex: index, policy };
      roomGroup.add(floorMesh);

      buildWallWithPortal(roomGroup, 'horizontal', -ROOM_SIZE / 2, WALL_HEIGHT, wallMaterial, true);
      buildWallWithPortal(roomGroup, 'vertical', -ROOM_SIZE / 2, WALL_HEIGHT, wallMaterial, true);
      buildWallWithPortal(roomGroup, 'vertical', ROOM_SIZE / 2, 0.72, wallMaterial, false);
      buildWallWithPortal(roomGroup, 'horizontal', ROOM_SIZE / 2, 0.72, wallMaterial, false);

      const trimMat = new THREE.MeshStandardMaterial({ color: policy.color, roughness: 0.45 });
      const trimBack = new THREE.Mesh(new THREE.BoxGeometry(ROOM_SIZE + 0.1, 0.22, WALL_THICK + 0.08), trimMat);
      trimBack.position.set(0, WALL_HEIGHT + 0.18, -ROOM_SIZE / 2);
      roomGroup.add(trimBack);

      const trimLeft = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICK + 0.08, 0.22, ROOM_SIZE + 0.1), trimMat);
      trimLeft.position.set(-ROOM_SIZE / 2, WALL_HEIGHT + 0.18, 0);
      roomGroup.add(trimLeft);

      const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 1.15, 0.18),
        new THREE.MeshBasicMaterial({ map: createRoomSignTexture(policy) })
      );
      signMesh.position.set(0, WALL_HEIGHT + 0.92, -ROOM_SIZE / 2);
      signMesh.userData = { type: 'room', policyIndex: index, policy };
      roomGroup.add(signMesh);

      const roomLight = new THREE.PointLight('#ffdfba', 0.42, 15, 1.6);
      roomLight.position.set(0.5, 3.8, 0.5);
      roomGroup.add(roomLight);

      policy.photos.forEach((photo, pIdx) => {
        createFramedArtwork(policy, photo, pIdx, roomGroup);
      });

      scene.add(roomGroup);
      roomObjects.push({ policyIndex: index, policy, center: roomCenter, group: roomGroup, floorMesh, light: roomLight });
    });

    // Passarelas Luminosas
    const bridgeDeckMat = new THREE.MeshStandardMaterial({ color: '#463527', roughness: 0.65, metalness: 0.15 });
    for (let i = 0; i < roomObjects.length; i++) {
      const currentRoom = roomObjects[i];
      const nextRoom = roomObjects[(i + 1) % roomObjects.length];
      const start = currentRoom.center;
      const end = nextRoom.center;
      const dist = start.distanceTo(end);
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const angle = Math.atan2(end.x - start.x, end.z - start.z);

      const bridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, dist), bridgeDeckMat);
      bridgeMesh.position.set(mid.x, 0.06, mid.z);
      bridgeMesh.rotation.y = angle;
      bridgeMesh.receiveShadow = true;
      scene.add(bridgeMesh);

      const stripMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.16, dist - 2.2),
        new THREE.MeshBasicMaterial({ color: currentRoom.policy.accent, transparent: true, opacity: 0.65 })
      );
      stripMesh.position.set(mid.x, 0.07, mid.z);
      stripMesh.rotation.y = angle;
      scene.add(stripMesh);
      walkwayStrips.push(stripMesh);
    }

    // Pátio Central & Telão
    const plazaGroup = new THREE.Group();
    const plazaDeck = new THREE.Mesh(
      new THREE.CylinderGeometry(4.6, 4.9, 0.22, 36),
      new THREE.MeshStandardMaterial({ color: '#3b2c20', roughness: 0.75 })
    );
    plazaDeck.position.y = 0.11;
    plazaDeck.receiveShadow = true;
    plazaGroup.add(plazaDeck);

    const plazaRing = new THREE.Mesh(
      new THREE.RingGeometry(3.8, 4.1, 36),
      new THREE.MeshBasicMaterial({ color: '#d99b43', side: THREE.DoubleSide })
    );
    plazaRing.rotation.x = -Math.PI / 2;
    plazaRing.position.y = 0.23;
    plazaGroup.add(plazaRing);

    const screenPivot = new THREE.Group();
    screenPivot.position.set(0, 2.75, 0);
    screenPivot.rotation.y = Math.PI / 4;

    const screenHousing = new THREE.Mesh(new THREE.BoxGeometry(6.8, 3.85, 0.34), woodTrimMaterial);
    screenHousing.castShadow = true;
    screenPivot.add(screenHousing);

    const screenGoldBorder = new THREE.Mesh(new THREE.BoxGeometry(6.55, 3.6, 0.38), goldFrameMaterial);
    screenPivot.add(screenGoldBorder);

    [-2.4, 2.4].forEach((px) => {
      const colMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.8, 12), woodTrimMaterial);
      colMesh.position.set(px, -1.4, 0);
      colMesh.castShadow = true;
      screenPivot.add(colMesh);
    });

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 960;
    offscreenCanvas.height = 500;
    const offCtx = offscreenCanvas.getContext('2d')!;
    const summaryScreenTexture = new THREE.CanvasTexture(offscreenCanvas);
    summaryScreenTexture.colorSpace = THREE.SRGBColorSpace;

    const screenPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6.25, 3.32),
      new THREE.MeshBasicMaterial({ map: summaryScreenTexture })
    );
    screenPlane.position.z = 0.21;
    screenPlane.userData = { type: 'summaryScreen' };
    screenPivot.add(screenPlane);

    plazaGroup.add(screenPivot);
    scene.add(plazaGroup);

    /**
     * ========================================================================
     * POPULAÇÃO DE EQUIPES TÉCNICAS E VISITANTES (CAMINHANDO E OBSERVANDO)
     * ========================================================================
     */
    const visitorsGroup = new THREE.Group();
    visitorsGroupRef.current = visitorsGroup;
    const visitorAgents: VisitorAgent[] = [];
    const visitorHitMeshes: THREE.Object3D[] = [];

    // 1. Observadores parados dentro de cada uma das 17 salas olhando para os quadros
    roomObjects.forEach((room, rIdx) => {
      const observersInRoom = rIdx % 2 === 0 ? 2 : 1;
      for (let k = 0; k < observersInRoom; k++) {
        const seed = rIdx * 7 + k * 3 + 1;
        const { personGroup, leftLeg, rightLeg, leftArm, rightArm, hitBox } = buildTechnicalPersonMesh(
          seed,
          room.policy,
          k === 0
        );

        // Posicionados diante das paredes de exposição (esquerda ou fundo)
        const isFacingLeftWall = k === 0;
        const localOffset = isFacingLeftWall
          ? new THREE.Vector3(-2.6, 0.16, -2.5 + (rIdx % 3) * 0.45)
          : new THREE.Vector3(2.4, 0.16, -2.6);

        const worldPos = room.center.clone().add(localOffset);
        personGroup.position.copy(worldPos);

        // Rotaciona o olhar na direção do quadro
        const lookTarget = isFacingLeftWall
          ? room.center.clone().add(new THREE.Vector3(-ROOM_SIZE / 2, 0.16, -3.1))
          : room.center.clone().add(new THREE.Vector3(3.1, 0.16, -ROOM_SIZE / 2));

        const angleToArt = Math.atan2(lookTarget.x - worldPos.x, lookTarget.z - worldPos.z);
        personGroup.rotation.y = angleToArt;

        const roleTitle = TECHNICAL_ROLES[(rIdx + k) % TECHNICAL_ROLES.length];
        hitBox.userData = {
          type: 'visitor',
          policyIndex: rIdx,
          policy: room.policy,
          roleTitle,
          actionLabel: 'Analisando acervo territorial na sala'
        };

        visitorsGroup.add(personGroup);
        visitorHitMeshes.push(hitBox);

        visitorAgents.push({
          group: personGroup,
          leftLeg,
          rightLeg,
          leftArm,
          rightArm,
          mode: 'observe',
          roomIndex: rIdx,
          nextRoomIndex: (rIdx + 1) % roomObjects.length,
          progress: 0,
          speed: 0,
          phase: seed * 1.3,
          basePos: worldPos.clone(),
          baseRotY: angleToArt,
          roleTitle,
          policy: room.policy
        });
      }
    });

    // 2. Equipes caminhando pelas passarelas luminosas entre as 17 salas
    const numWalkers = 10;
    for (let w = 0; w < numWalkers; w++) {
      const startRoomIdx = (w * 2) % roomObjects.length;
      const nextRoomIdx = (startRoomIdx + 1) % roomObjects.length;
      const policy = roomObjects[startRoomIdx].policy;
      const seed = 100 + w * 5;

      const { personGroup, leftLeg, rightLeg, leftArm, rightArm, hitBox } = buildTechnicalPersonMesh(
        seed,
        policy,
        w % 2 === 1
      );

      const roleTitle = TECHNICAL_ROLES[w % TECHNICAL_ROLES.length];
      hitBox.userData = {
        type: 'visitor',
        policyIndex: startRoomIdx,
        policy,
        roleTitle,
        actionLabel: 'Em deslocamento pelo circuito das políticas'
      };

      visitorsGroup.add(personGroup);
      visitorHitMeshes.push(hitBox);

      visitorAgents.push({
        group: personGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        mode: 'walk',
        roomIndex: startRoomIdx,
        nextRoomIndex: nextRoomIdx,
        progress: (w * 0.37) % 1,
        speed: 0.14 + (w % 4) * 0.025,
        phase: w * 2.1,
        basePos: new THREE.Vector3(),
        baseRotY: 0,
        roleTitle,
        policy
      });
    }

    // 3. Pequeno grupo reunido próximo ao Telão do Pátio Central
    [
      { pos: new THREE.Vector3(2.8, 0.22, 3.1), target: new THREE.Vector3(0, 0.22, 0), seed: 201 },
      { pos: new THREE.Vector3(3.4, 0.22, 2.2), target: new THREE.Vector3(0, 0.22, 0), seed: 202 }
    ].forEach((plazaVisitor, idx) => {
      const pol = INITIAL_POLICIES[idx];
      const { personGroup, leftLeg, rightLeg, leftArm, rightArm, hitBox } = buildTechnicalPersonMesh(
        plazaVisitor.seed,
        pol,
        idx === 0
      );
      personGroup.position.copy(plazaVisitor.pos);
      const rot = Math.atan2(
        plazaVisitor.target.x - plazaVisitor.pos.x,
        plazaVisitor.target.z - plazaVisitor.pos.z
      );
      personGroup.rotation.y = rot;

      hitBox.userData = {
        type: 'visitor',
        policyIndex: -2,
        policy: pol,
        roleTitle: 'Coordenação CPPS / DAPS POA',
        actionLabel: 'Acompanhando painel geral no pátio central'
      };

      visitorsGroup.add(personGroup);
      visitorHitMeshes.push(hitBox);

      visitorAgents.push({
        group: personGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        mode: 'observe',
        roomIndex: 0,
        nextRoomIndex: 1,
        progress: 0,
        speed: 0,
        phase: idx * 1.9,
        basePos: plazaVisitor.pos.clone(),
        baseRotY: rot,
        roleTitle: 'Coordenação CPPS / DAPS POA',
        policy: pol
      });
    });

    scene.add(visitorsGroup);

    sceneObjectsRef.current = {
      ...sceneObjectsRef.current,
      scene,
      camera,
      controls,
      roomObjects,
      artworkMeshes,
      walkwayStrips,
      visitorHitMeshes,
      screenPlane,
      addFrameToRoom: (policyIdx: number, policyObj: Policy, photoObj: PhotoItem, slotIdx: number) => {
        const rObj = roomObjects[policyIdx];
        if (rObj) createFramedArtwork(policyObj, photoObj, slotIdx, rObj.group);
      }
    };

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (visitorsGroup.visible) {
        const visitorHits = raycaster.intersectObjects(visitorHitMeshes, false);
        if (visitorHits.length > 0) {
          const { roleTitle, actionLabel, policy } = visitorHits[0].object.userData as {
            roleTitle: string;
            actionLabel: string;
            policy: Policy;
          };
          renderer.domElement.style.cursor = 'pointer';
          setTooltip({
            visible: true,
            x: Math.min(e.clientX, window.innerWidth - 270),
            y: Math.min(e.clientY, window.innerHeight - 100),
            tag: `Equipe Técnica • ${policy.shortTitle}`,
            title: roleTitle,
            sub: actionLabel,
            color: policy.accent
          });
          return;
        }
      }

      const screenHits = raycaster.intersectObject(screenPlane, false);
      if (screenHits.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        setTooltip({
          visible: true,
          x: Math.min(e.clientX, window.innerWidth - 270),
          y: Math.min(e.clientY, window.innerHeight - 100),
          tag: 'Pátio Central • CPPS POA',
          title: 'Telão de Vídeo-Resumo das 17 Políticas',
          sub: 'Clique para ampliar ou carregar vídeo (.mp4)',
          color: '#76c7c0'
        });
        return;
      }

      const artHits = raycaster.intersectObjects(artworkMeshes, false);
      if (artHits.length > 0) {
        const { policy, photo } = artHits[0].object.userData as { policy: Policy; photo: PhotoItem };
        renderer.domElement.style.cursor = 'pointer';
        setTooltip({
          visible: true,
          x: Math.min(e.clientX, window.innerWidth - 270),
          y: Math.min(e.clientY, window.innerHeight - 100),
          tag: `Obra • ${policy.shortTitle}`,
          title: photo.title,
          sub: 'Clique para abrir a fotografia ampliada',
          color: policy.accent
        });
        return;
      }

      const roomHits = raycaster.intersectObjects(
        roomObjects.map((r) => r.floorMesh),
        false
      );
      if (roomHits.length > 0) {
        const { policy } = roomHits[0].object.userData as { policy: Policy };
        renderer.domElement.style.cursor = 'pointer';
        setTooltip({
          visible: true,
          x: Math.min(e.clientX, window.innerWidth - 270),
          y: Math.min(e.clientY, window.innerHeight - 100),
          tag: `Ala ${policy.number} • Circuito CPPS`,
          title: policy.title,
          sub: 'Clique para aproximar a câmera nesta sala',
          color: policy.accent
        });
        return;
      }

      renderer.domElement.style.cursor = 'grab';
      setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (visitorsGroup.visible) {
        const visitorHits = raycaster.intersectObjects(visitorHitMeshes, false);
        if (visitorHits.length > 0) {
          const { policyIndex } = visitorHits[0].object.userData as { policyIndex: number };
          if (policyIndex >= 0) focusRoomRef.current(policyIndex, false);
          return;
        }
      }

      const screenHits = raycaster.intersectObject(screenPlane, false);
      if (screenHits.length > 0) {
        setIsAutoTour(false);
        setVideoModalOpen(true);
        return;
      }

      const artHits = raycaster.intersectObjects(artworkMeshes, false);
      if (artHits.length > 0) {
        setIsAutoTour(false);
        const { policy, photo } = artHits[0].object.userData as { policy: Policy; photo: PhotoItem };
        setSelectedArtwork({ policy, photo });
        return;
      }

      const roomHits = raycaster.intersectObjects(
        roomObjects.map((r) => r.floorMesh),
        false
      );
      if (roomHits.length > 0) {
        const { policyIndex } = roomHits[0].object.userData as { policyIndex: number };
        focusRoomRef.current(policyIndex, false);
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      const newAspect = window.innerWidth / window.innerHeight;
      camera.left = (-frustumSize * newAspect) / 2;
      camera.right = (frustumSize * newAspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const startTime = performance.now();
    function renderSummaryFrame(now: number) {
      const elapsed = (now - startTime) / 1000;
      const slideDuration = 3.2;
      const totalSlides = INITIAL_POLICIES.length + 1;
      const slideIndex = Math.floor(elapsed / slideDuration) % totalSlides;
      const slideProgress = (elapsed % slideDuration) / slideDuration;
      const W = offscreenCanvas.width;
      const H = offscreenCanvas.height;

      if (slideIndex === 0) {
        const grad = offCtx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#1f1712');
        grad.addColorStop(1, '#3b2718');
        offCtx.fillStyle = grad;
        offCtx.fillRect(0, 0, W, H);

        offCtx.save();
        offCtx.strokeStyle = 'rgba(217, 155, 67, 0.22)';
        offCtx.lineWidth = 3;
        offCtx.beginPath();
        offCtx.arc(W - 160, H / 2, 160 + Math.sin(elapsed * 2) * 10, 0, Math.PI * 2);
        offCtx.stroke();
        offCtx.restore();

        offCtx.fillStyle = '#d99b43';
        offCtx.font = 'bold 20px sans-serif';
        offCtx.fillText('COORDENAÇÃO DE POLÍTICAS PÚBLICAS DE SAÚDE • DAPS / SMS POA', 56, 95);

        offCtx.fillStyle = '#f7efe4';
        offCtx.font = 'bold 46px Georgia, serif';
        offCtx.fillText('17 Políticas Públicas de Saúde', 56, 175);
        offCtx.fillText('nos Territórios de Porto Alegre', 56, 232);

        offCtx.fillStyle = '#d6c5b3';
        offCtx.font = '22px sans-serif';
        offCtx.fillText('Equidade, integralidade e cuidado em rede na Atenção Primária à Saúde.', 56, 305);

        INITIAL_POLICIES.forEach((p, idx) => {
          offCtx.fillStyle = p.color;
          offCtx.fillRect(56 + idx * 48, 360, 38, 16);
        });

        offCtx.fillStyle = '#76c7c0';
        offCtx.font = 'bold 18px sans-serif';
        offCtx.fillText('▶ Clique neste telão para ampliar ou carregar vídeo institucional (.mp4)', 56, 435);
      } else {
        const p = INITIAL_POLICIES[slideIndex - 1];
        const grad = offCtx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#1d1612');
        grad.addColorStop(1, p.color);
        offCtx.fillStyle = grad;
        offCtx.fillRect(0, 0, W, H);

        offCtx.fillStyle = 'rgba(20, 15, 12, 0.78)';
        offCtx.fillRect(42, 42, W - 84, H - 84);

        offCtx.fillStyle = p.color;
        offCtx.fillRect(42, 42, 14, H - 84);

        offCtx.fillStyle = p.accent;
        offCtx.font = 'bold 22px sans-serif';
        offCtx.fillText(`ALA ${p.number} DE 17 • PANORAMA TERRITORIAL`, 84, 105);

        offCtx.fillStyle = '#f7efe4';
        offCtx.font = 'bold 40px Georgia, serif';
        offCtx.fillText(p.title, 84, 172);

        offCtx.fillStyle = '#e5d8c8';
        offCtx.font = '22px sans-serif';
        const words = p.directive.split(' ');
        let line = '';
        let ly = 235;
        words.forEach((w) => {
          const test = line + w + ' ';
          if (offCtx.measureText(test).width > W - 180) {
            offCtx.fillText(line, 84, ly);
            line = w + ' ';
            ly += 34;
          } else {
            line = test;
          }
        });
        offCtx.fillText(line, 84, ly);

        offCtx.fillStyle = p.accent;
        offCtx.font = 'bold 19px sans-serif';
        offCtx.fillText(`📍 ${p.territoryDefault}`, 84, 385);
      }

      offCtx.fillStyle = 'rgba(255,255,255,0.18)';
      offCtx.fillRect(0, H - 10, W, 10);
      offCtx.fillStyle = '#d99b43';
      offCtx.fillRect(0, H - 10, W * slideProgress, 10);

      summaryScreenTexture.needsUpdate = true;

      if (modalCanvasRef.current) {
        const mCtx = modalCanvasRef.current.getContext('2d');
        if (mCtx) mCtx.drawImage(offscreenCanvas, 0, 0);
      }
    }

    let prevTime = performance.now();
    let animFrameId: number;

    const animate = (now: number = performance.now()) => {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;

      renderSummaryFrame(now);

      const pulseOpacity = 0.45 + 0.35 * Math.sin(now * 0.003);
      walkwayStrips.forEach((strip) => {
        (strip.material as THREE.MeshBasicMaterial).opacity = pulseOpacity;
      });

      // Animação dos personagens (caminhada nas passarelas + contemplação nas salas)
      if (visitorsGroup.visible) {
        const tSec = now * 0.001;
        visitorAgents.forEach((agent) => {
          if (agent.mode === 'walk') {
            agent.progress += agent.speed * dt;
            if (agent.progress >= 1) {
              agent.progress -= 1;
              agent.roomIndex = agent.nextRoomIndex;
              agent.nextRoomIndex = (agent.nextRoomIndex + 1) % roomObjects.length;
              const newPolicy = roomObjects[agent.roomIndex].policy;
              agent.policy = newPolicy;
              const hitMesh = agent.group.children[agent.group.children.length - 1];
              if (hitMesh) {
                hitMesh.userData.policyIndex = agent.roomIndex;
                hitMesh.userData.policy = newPolicy;
              }
            }

            const startCenter = roomObjects[agent.roomIndex].center;
            const endCenter = roomObjects[agent.nextRoomIndex].center;
            const currentPos = new THREE.Vector3().lerpVectors(startCenter, endCenter, agent.progress);
            const stride = Math.sin(tSec * 7.5 + agent.phase);

            agent.group.position.set(currentPos.x, 0.16 + Math.abs(stride) * 0.035, currentPos.z);
            agent.group.rotation.y = Math.atan2(
              endCenter.x - startCenter.x,
              endCenter.z - startCenter.z
            );

            agent.leftLeg.rotation.x = stride * 0.45;
            agent.rightLeg.rotation.x = -stride * 0.45;
            agent.leftArm.rotation.x = -stride * 0.35;
            agent.rightArm.rotation.x = stride * 0.35;
          } else {
            // Observador: leve balanço natural e movimento de cabeça/braço comentando a fotografia
            const idleWave = Math.sin(tSec * 1.8 + agent.phase);
            agent.group.rotation.y = agent.baseRotY + idleWave * 0.14;
            agent.group.position.y = agent.basePos.y + Math.sin(tSec * 2.4 + agent.phase) * 0.012;
            agent.leftArm.rotation.z = 0.06 + Math.max(0, idleWave) * 0.18;
          }
        });
      }

      const st = sceneObjectsRef.current;
      if (st.isTransitioning) {
        controls.target.lerp(st.desiredTarget, 0.065);
        camera.position.lerp(st.desiredCameraPos, 0.065);
        camera.zoom = THREE.MathUtils.lerp(camera.zoom, st.desiredZoom, 0.065);
        camera.updateProjectionMatrix();

        if (
          controls.target.distanceTo(st.desiredTarget) < 0.04 &&
          Math.abs(camera.zoom - st.desiredZoom) < 0.01
        ) {
          st.isTransitioning = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(domEl)) container.removeChild(domEl);
    };
  }, []);

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPolicy = policies[formPolicyIdx];
    if (!targetPolicy) return;

    const finalImg =
      formFileDataUrl ||
      formUrl.trim() ||
      generateArtworkDataURL(
        targetPolicy,
        { title: formTitle, territory: formTerritory, motif: 'sunburst' },
        targetPolicy.photos.length
      );

    const newPhoto: PhotoItem = {
      title: formTitle.trim(),
      territory: formTerritory.trim(),
      date: 'Acervo Atualizado • Porto Alegre/RS',
      description: formDesc.trim(),
      credits: formCredits.trim() || 'Acervo CPPS / SMS Porto Alegre',
      imageUrl: finalImg
    };

    const slotIdx = targetPolicy.photos.length;
    setPolicies((prev) =>
      prev.map((pol, idx) =>
        idx === formPolicyIdx ? { ...pol, photos: [...pol.photos, newPhoto] } : pol
      )
    );

    if (sceneObjectsRef.current.addFrameToRoom) {
      sceneObjectsRef.current.addFrameToRoom(formPolicyIdx, targetPolicy, newPhoto, slotIdx);
    }

    setCuratorModalOpen(false);
    setFormTitle('');
    setFormTerritory('');
    setFormDesc('');
    setFormCredits('');
    setFormUrl('');
    setFormFileDataUrl(null);
    focusRoom(formPolicyIdx, false);
    showToast(`✅ Foto pendurada na sala "${targetPolicy.shortTitle}"!`);
  };

  const handleExportJSON = () => {
    const payload = policies.map((p) => ({
      id: p.id,
      numero: p.number,
      politica: p.title,
      diretriz: p.directive,
      cor: p.color,
      obras: p.photos
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acervo-galeria-cpps-poa.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📁 JSON do acervo CPPS exportado!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const resultText = ev.target?.result as string;
        const imported = JSON.parse(resultText);
        if (!Array.isArray(imported)) throw new Error('Invalid JSON');
        setPolicies((prev) =>
          prev.map((pol, idx) => {
            const match = imported[idx];
            if (!match || !Array.isArray(match.obras)) return pol;
            const newObras = match.obras.slice(pol.photos.length);
            const mappedObras: PhotoItem[] = newObras.map((obra: Record<string, string>, offset: number) => {
              const photoObj: PhotoItem = {
                title: obra.title || obra.titulo || 'Registro Territorial',
                territory: obra.territory || obra.territorio || pol.territoryDefault,
                date: obra.date || obra.data || 'Porto Alegre, RS',
                description: obra.description || obra.relato || '',
                credits: obra.credits || obra.creditos || 'Acervo CPPS',
                imageUrl:
                  obra.imageUrl ||
                  generateArtworkDataURL(
                    pol,
                    { title: obra.title || 'Obra', territory: pol.territoryDefault, motif: 'sunburst' },
                    pol.photos.length + offset
                  )
              };
              if (sceneObjectsRef.current.addFrameToRoom) {
                sceneObjectsRef.current.addFrameToRoom(idx, pol, photoObj, pol.photos.length + offset);
              }
              return photoObj;
            });
            return {
              ...pol,
              photos: [...pol.photos, ...mappedObras]
            };
          })
        );
        showToast('✅ Acervo JSON importado para as salas 3D!');
      } catch {
        showToast('⚠️ Não foi possível ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const activePolicy = activeIndex >= 0 ? policies[activeIndex] : null;
  const totalTourSteps = policies.length + 2;
  const tourProgressPct = Math.round(((tourStep + 1) / totalTourSteps) * 100);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1c1713] text-[#f7efe4] select-none font-sans">
      {/* Container do Canvas 3D */}
      <div ref={mountRef} className="fixed inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Tooltip Flutuante */}
      {tooltip.visible && (
        <div
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
          className="fixed z-40 pointer-events-none bg-[#221b16]/90 backdrop-blur-md border border-amber-300/30 rounded-xl px-3.5 py-2.5 max-w-xs shadow-2xl"
        >
          <div
            style={{ color: tooltip.color }}
            className="text-[10px] uppercase tracking-widest font-bold"
          >
            {tooltip.tag}
          </div>
          <div className="text-sm font-semibold text-stone-100 leading-snug mt-0.5">
            {tooltip.title}
          </div>
          <div className="text-xs text-stone-300/80 mt-0.5">{tooltip.sub}</div>
        </div>
      )}

      {/* Barra Superior */}
      <header className="fixed top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-[#221b16]/85 backdrop-blur-md border border-amber-200/20 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3.5 pointer-events-auto max-w-xl">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title="Alternar menu das 17 políticas"
            className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/25 text-amber-200 transition active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300/90">
                DAPS / SMS Porto Alegre
              </span>
            </div>
            <h1 className="text-sm sm:text-lg font-bold text-stone-100 leading-tight font-serif">
              PAVILHÃO CPPS — Galeria das 17 Políticas
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <button
            onClick={handleToggleTour}
            className={`backdrop-blur-md px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition active:scale-95 shadow-lg ${
              isAutoTour
                ? 'bg-amber-500 text-stone-950 border-amber-300'
                : 'bg-[#221b16]/85 hover:bg-amber-500/20 text-amber-200 border-amber-400/40'
            }`}
          >
            {isAutoTour ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-amber-400" />}
            <span>{isAutoTour ? 'Pausar Tour' : 'Iniciar Tour Automático'}</span>
          </button>

          <button
            onClick={() => setShowVisitors((v) => !v)}
            title="Mostrar ou ocultar equipes técnicas na galeria"
            className={`backdrop-blur-md px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition active:scale-95 shadow-lg ${
              showVisitors
                ? 'bg-[#221b16]/85 hover:bg-stone-800/90 text-amber-200 border-amber-300/30'
                : 'bg-[#221b16]/65 text-stone-400 border-stone-200/15'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Equipes</span>
          </button>

          <button
            onClick={() => {
              setIsAutoTour(false);
              setVideoModalOpen(true);
            }}
            className="bg-[#221b16]/85 backdrop-blur-md hover:bg-stone-800/90 text-stone-100 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-stone-200/20 transition active:scale-95 shadow-lg"
          >
            <MonitorPlay className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Vídeo-Resumo</span>
          </button>

          <button
            onClick={() => focusAerial(false)}
            className="bg-[#221b16]/85 backdrop-blur-md hover:bg-stone-800/90 text-stone-100 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-amber-300/25 transition active:scale-95 shadow-lg"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Visão Aérea</span>
          </button>

          <button
            onClick={() => {
              setIsAutoTour(false);
              if (activeIndex >= 0) setFormPolicyIdx(activeIndex);
              setCuratorModalOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Foto</span>
          </button>
        </div>
      </header>

      {/* Menu Lateral (Índice das 17 Políticas) */}
      <aside
        className={`fixed top-24 bottom-28 left-4 z-20 w-80 max-w-[calc(100vw-2rem)] bg-[#221b16]/88 backdrop-blur-md border border-amber-200/20 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 border-b border-stone-200/15">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Alas Temáticas (17)
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-semibold">
              {totalWorksCount} obras
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar política ou território..."
              className="w-full bg-stone-950/60 border border-stone-200/15 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-400/60"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {filteredPolicies.map((policy) => {
            const isActive = activeIndex === policy.originalIndex;
            return (
              <button
                key={policy.id}
                onClick={() => {
                  focusRoom(policy.originalIndex, false);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-2.5 transition ${
                  isActive
                    ? 'bg-amber-500/25 border border-amber-400/50 text-stone-100'
                    : 'hover:bg-stone-800/65 border border-transparent text-stone-200/90'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    style={{ backgroundColor: policy.color }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-stone-950 shrink-0"
                  >
                    {policy.number}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{policy.title}</div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {policy.territoryDefault}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-950/60 text-stone-300 shrink-0 flex items-center gap-1">
                  {policy.photos.length} <Camera className="w-3 h-3" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-stone-200/10 bg-stone-950/30 flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-stone-300 hover:text-amber-200 cursor-pointer flex items-center gap-1 transition">
            <Upload className="w-3.5 h-3.5" /> Importar JSON
            <input type="file" accept="application/json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button
            onClick={handleExportJSON}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition"
          >
            <Download className="w-3.5 h-3.5" /> Exportar JSON
          </button>
        </div>
      </aside>

      {/* HUD Inferior de Navegação */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#221b16]/88 backdrop-blur-md border border-amber-300/25 shadow-2xl rounded-2xl px-4 py-3 flex flex-col gap-2 w-[92vw] max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              style={{
                backgroundColor:
                  activeIndex === -1
                    ? '#d99b43'
                    : activeIndex === -2
                    ? '#76c7c0'
                    : activePolicy?.color
              }}
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-amber-300/90 font-bold">
                  {activeIndex === -1
                    ? 'Visão Panorâmica do Circuito CPPS (17 Alas Conectadas)'
                    : activeIndex === -2
                    ? 'Pátio Central • Apresentação Geral'
                    : `Ala ${activePolicy?.number} de 17 • ${activePolicy?.territoryDefault}`}
                </span>
                {isAutoTour && (
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-extrabold">
                    Tour Guiado Ativo
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                {activeIndex === -1
                  ? 'Pavilhão Territorial — Atenção Primária à Saúde de Porto Alegre'
                  : activeIndex === -2
                  ? 'Telão Institucional — Panorama das 17 Políticas Públicas de Saúde'
                  : activePolicy?.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-stone-200/15 shrink-0">
            <select
              value={tourSpeedMs}
              onChange={(e) => setTourSpeedMs(Number(e.target.value))}
              title="Ritmo do passeio automático"
              className="bg-stone-950/70 border border-stone-200/15 rounded-lg px-2 py-1 text-[11px] text-stone-200 focus:outline-none"
            >
              <option value={5500}>Normal (5.5s)</option>
              <option value={3500}>Rápido (3.5s)</option>
              <option value={8500}>Exposição (8.5s)</option>
            </select>
            <button
              onClick={() =>
                focusRoom(activeIndex <= 0 ? policies.length - 1 : activeIndex - 1, false)
              }
              title="Sala Anterior"
              className="p-1.5 rounded-lg hover:bg-stone-700/60 text-stone-200 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                focusRoom(activeIndex >= policies.length - 1 ? 0 : activeIndex + 1, false)
              }
              title="Próxima Sala"
              className="p-1.5 rounded-lg hover:bg-stone-700/60 text-stone-200 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-200/90 leading-relaxed bg-stone-950/45 rounded-xl px-3 py-2 border border-stone-200/10">
          {activeIndex === -1
            ? 'Todas as 17 salas são interligadas por portais e passarelas luminosas percorridas pelas equipes técnicas. Clique em qualquer ala, pessoa, quadro ou no Telão Central.'
            : activeIndex === -2
            ? 'Síntese da Coordenação de Políticas Públicas de Saúde (CPPS/DAPS): promovendo equidade, acesso universal e cuidado integral nos territórios.'
            : activePolicy?.directive}
        </p>

        {isAutoTour && (
          <div className="w-full bg-stone-950/80 h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${tourProgressPct}%` }}
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300"
            />
          </div>
        )}
      </div>

      {/* MODAL LIGHTBOX (Detalhes da Obra) */}
      {selectedArtwork && (
        <div
          onClick={() => setSelectedArtwork(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#221b16]/95 border border-amber-300/25 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 max-h-[90vh]"
          >
            <div className="md:col-span-7 bg-stone-950/90 flex items-center justify-center p-4 sm:p-6 min-h-[260px]">
              <img
                src={selectedArtwork.photo.imageUrl}
                alt={selectedArtwork.photo.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl border border-amber-200/20"
              />
            </div>

            <div className="md:col-span-5 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    style={{ backgroundColor: selectedArtwork.policy.color }}
                    className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-stone-950"
                  >
                    {selectedArtwork.policy.number} • {selectedArtwork.policy.shortTitle}
                  </span>
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-xs font-semibold text-amber-300/90 mt-4 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {selectedArtwork.photo.territory}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mt-1.5 leading-snug font-serif">
                  {selectedArtwork.photo.title}
                </h2>

                <p className="text-xs text-stone-400 mt-1">{selectedArtwork.photo.date}</p>

                <div className="h-px bg-stone-200/15 my-4" />

                <p className="text-sm text-stone-200/90 leading-relaxed">
                  {selectedArtwork.photo.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200/10 flex items-center justify-between text-xs text-stone-400">
                <span>{selectedArtwork.photo.credits}</span>
                <span className="text-amber-300/80 font-medium">SUS Porto Alegre</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VÍDEO-RESUMO */}
      {videoModalOpen && (
        <div
          onClick={() => setVideoModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#221b16]/95 border border-amber-300/25 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            <div className="px-6 py-4 border-b border-stone-200/15 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Telão do Pátio Central • CPPS Porto Alegre
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-stone-100 font-serif">
                  Síntese Audiovisual das 17 Políticas Públicas de Saúde
                </h2>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-stone-950/80 flex flex-col items-center justify-center">
              {!customMp4Url ? (
                <canvas
                  ref={modalCanvasRef}
                  width={960}
                  height={500}
                  className="w-full max-h-[54vh] rounded-2xl border border-amber-300/20 shadow-2xl object-contain bg-stone-900"
                />
              ) : (
                <video
                  src={customMp4Url}
                  controls
                  autoPlay
                  className="w-full max-h-[54vh] rounded-2xl border border-amber-300/20 shadow-2xl bg-black"
                />
              )}
            </div>

            <div className="px-6 py-4 bg-stone-950/50 border-t border-stone-200/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                  <Film className="w-4 h-4" /> Carregar Vídeo (.mp4)
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setCustomMp4Url(URL.createObjectURL(f));
                        showToast('🎬 Vídeo institucional carregado no telão!');
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {customMp4Url && (
                  <button
                    onClick={() => setCustomMp4Url(null)}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Voltar à Apresentação Animada
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setVideoModalOpen(false);
                  setTourStep(2);
                  setIsAutoTour(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
              >
                <Sparkles className="w-4 h-4" /> Iniciar Passeio pelas 17 Alas →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CURADORIA (Adicionar Foto) */}
      {curatorModalOpen && (
        <div
          onClick={() => setCuratorModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#221b16]/95 border border-amber-300/25 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/15">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                  Modo Curadoria
                </span>
                <h2 className="text-xl font-bold text-stone-100 font-serif">
                  Pendurar Nova Fotografia na Sala
                </h2>
              </div>
              <button
                onClick={() => setCuratorModalOpen(false)}
                className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  1. Escolha a Política Pública (Ala do Pavilhão)
                </label>
                <select
                  value={formPolicyIdx}
                  onChange={(e) => setFormPolicyIdx(Number(e.target.value))}
                  className="w-full bg-stone-950/75 border border-stone-200/20 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                >
                  {policies.map((pol, idx) => (
                    <option key={pol.id} value={idx}>
                      {pol.number}. {pol.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  2. Arquivo de Imagem (Upload local ou URL)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setFormFileDataUrl(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-stone-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-200 hover:file:bg-amber-500/30 bg-stone-950/50 border border-stone-200/15 rounded-xl p-1.5"
                />
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="Ou cole uma URL de imagem (https://...)"
                  className="mt-2 w-full bg-stone-950/75 border border-stone-200/20 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    3. Título da Obra
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex.: Roda de Cuidado no Território"
                    className="w-full bg-stone-950/75 border border-stone-200/20 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    4. Território / Gerência
                  </label>
                  <input
                    type="text"
                    required
                    value={formTerritory}
                    onChange={(e) => setFormTerritory(e.target.value)}
                    placeholder="Ex.: GD Sul / Restinga"
                    className="w-full bg-stone-950/75 border border-stone-200/20 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  5. Relato / Legenda da Ação
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Descreva o contexto da ação, unidade de saúde, participação comunitária..."
                  className="w-full bg-stone-950/75 border border-stone-200/20 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  6. Créditos / Autoria
                </label>
                <input
                  type="text"
                  value={formCredits}
                  onChange={(e) => setFormCredits(e.target.value)}
                  placeholder="Ex.: Equipe e-Multi / Fotografia: Maria Silva"
                  className="w-full bg-stone-950/75 border border-stone-200/20 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCuratorModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:bg-stone-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg transition"
                >
                  Pendurar na Parede 3D
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notificação Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#221b16]/95 border border-emerald-400/40 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
}