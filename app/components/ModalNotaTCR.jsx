import React from 'react';
import { X, BookOpen, AlertTriangle, Scale, ExternalLink } from 'lucide-react';

export default function ModalNotaTCR({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full hover:bg-zinc-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho do Modal */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">
              Análise Qualitativa — (c)sistema
            </span>
            <h3 className="text-xl font-bold text-white">
              {item.tipo} {item.numero}/{item.ano}
            </h3>
          </div>
        </div>

        {/* Ementa Oficial */}
        <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl mb-6">
          <span className="text-xs font-medium text-zinc-500 block mb-1">EMENTA OFICIAL DA PROPOSIÇÃO</span>
          <p className="text-sm text-zinc-300 leading-relaxed font-serif italic">
            "{item.ementa}"
          </p>
        </div>

        {/* Leitura Crítica do TCR */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Scale className="w-4 h-4 text-violet-400" />
            Apontamento Teórico-Político (Saúde Coletiva / Gestão):
          </h4>
          
          <div className="p-4 bg-violet-950/20 border border-violet-800/30 rounded-xl space-y-2">
            <p className="text-xs text-violet-200 leading-relaxed">
              Esta proposição reflete a disputa em torno do corpo trans no aparato legislativo estatal. 
              Em um viés qualitativo, observa-se como a produção legislativa atua como mediadora ou barreira 
              no acesso às políticas de saúde e cidadania, tensionando as diretrizes do SUS e do Processo Transexualizador.
            </p>
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-800/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Efeito no Território e na Gestão:</strong> Propostas de caráter restritivo geram impactos subjetivos e institucionais na ponta da rede (UBSs, ambulatórios e regulação), reforçando barreiras de entrada e invisibilidades no e-SUS.
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.postura?.color || 'bg-zinc-800 text-zinc-300'}`}>
            {item.postura?.label || 'Análise Pendente'}
          </span>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition"
          >
            Ver Tramitação na Câmara
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}