'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

interface Card {
  category: string;
  label: string;
  icon: string;
  text: string;
  hint: string;
}

const baseCards: Card[] = [
  // Nível 1: Esquenta
  { category: 'n1', label: '🌸 Nível 1 • Esquenta', icon: '🧁', text: 'Qual foi a menor coisa fofa ou bobinha que fez seu coração esquentar essa semana?', hint: 'Valem detalhes do dia a dia!' },
  { category: 'n1', label: '🌸 Nível 1 • Esquenta', icon: '🍵', text: 'Qual ritual silencioso só seu te traz a sensação imediata de estar em casa?', hint: 'Aquele momentinho sagrado do seu dia.' },
  { category: 'n1', label: '🌸 Nível 1 • Esquenta', icon: '🎀', text: 'Se você pudesse mandar uma mensagem de 5 segundos pro seu "eu" de 5 anos atrás, o que diria?', hint: 'Com todo o carinho do mundo.' },
  { category: 'n1', label: '🌸 Nível 1 • Esquenta', icon: '🎨', text: 'Que música, filme ou livro ultimamente te fez sentir que alguém entendeu exatamente como você pensa?', hint: 'A arte de se sentir visto.' },
  { category: 'n1', label: '🌸 Nível 1 • Esquenta', icon: '🥐', text: 'Qual comida tem gosto ou cheiro puro de memória de infância e acolhimento?', hint: 'Comida com alma.' },

  // Nível 2: Vulnerabilidade
  { category: 'n2', label: '🧸 Nível 2 • Vulnerável', icon: '🩹', text: 'Em qual parte da sua vida você sente que está tentando parecer forte demais em vez de pedir colo?', hint: 'Não precisa carregar tudo só.' },
  { category: 'n2', label: '🧸 Nível 2 • Vulnerável', icon: '🌧️', text: 'Qual é a coisa mais difícil de explicar para as pessoas sobre como seus dias ruins funcionam?', hint: 'Sua forma de se reorganizar.' },
  { category: 'n2', label: '🧸 Nível 2 • Vulnerável', icon: '🗝️', text: 'Qual expectativa sobre você mesmo você finalmente está aprendendo a soltar?', hint: 'Tirar a armadura também é descanso.' },
  { category: 'n2', label: '🧸 Nível 2 • Vulnerável', icon: '🪞', text: 'O que você gostaria que as pessoas percebessem em você antes de você precisar falar?', hint: 'O que fica reservado no peito?' },
  { category: 'n2', label: '🧸 Nível 2 • Vulnerável', icon: '🧩', text: 'Qual pequeno limite você aprendeu a colocar recentemente que mudou sua paz mental?', hint: 'Dizer não é um ato de amor.' },

  // Nível 3: Raízes & Afetos
  { category: 'n3', label: '☁️ Nível 3 • Raízes', icon: '🌷', text: 'O que em você se transformou tanto nos últimos dois anos que você sente orgulho de olhar?', hint: 'Reconheça a sua caminhada.' },
  { category: 'n3', label: '☁️ Nível 3 • Raízes', icon: '💌', text: 'O que você mais sente necessidade de ouvir da pessoa que você ama neste exato momento?', hint: 'Pode pedir validação sem medo.' },
  { category: 'n3', label: '☁️ Nível 3 • Raízes', icon: '🕊️', text: 'Qual ferida antiga do passado hoje você consegue olhar com doçura porque te ensinou a se proteger?', hint: 'Cicatrizes que viraram sabedoria.' },
  { category: 'n3', label: '☁️ Nível 3 • Raízes', icon: '🕯️️', text: 'Quando foi a última vez que você se sentiu acolhido por inteiro com todas as suas imperfeições?', hint: 'Quem te dá esse abraço quentinho?' },
  { category: 'n3', label: '☁️ Nível 3 • Raízes', icon: '🪴', text: 'Que sonho antigo você tinha deixado na gaveta e agora sente vontade de regar de novo?', hint: 'Dê espaço pro seu desejo.' },

  // Dinâmicas
  { category: 'action', label: '🎲 Dinâmica • Pausa', icon: '🫂', text: 'Pausa para o Abraço 💗\n\nEscolha alguém da roda para dar um abraço bem demorado em silêncio por 10 segundos.', hint: 'Sinta a presença do outro.' },
  { category: 'action', label: '🎲 Dinâmica • Espelho', icon: '🪞', text: 'Carta Espelho ✨\n\nEscolha alguém do grupo para responder a esta mesma pergunta junto com você!', hint: 'Dividir a experiência.' },
  { category: 'action', label: '🎲 Dinâmica • Afeto', icon: '💐', text: 'Validação Sincera 🌸\n\nOlhe para a pessoa à sua esquerda e diga uma qualidade linda nela que talvez ela não perceba.', hint: 'Elogio com presença.' },
  { category: 'action', label: '🎲 Dinâmica • Leveza', icon: '🎈', text: 'Passe Livre Com Gafe 🎟️\n\nVocê pode pular a vez, mas só se contar uma historinha engraçada ou gafe recente!', hint: 'Rir de si mesmo é libertador.' }
];

export default function SemArmadura() {
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [availableDeck, setAvailableDeck] = useState<Card[]>([]);
  const [customCards, setCustomCards] = useState<Card[]>([]);
  const [drawnCount, setDrawnCount] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const [currentCard, setCurrentCard] = useState<Card>({
    category: 'n1',
    label: '🌸 Nível 1 • Esquenta',
    icon: '🎀',
    text: 'Sua pergunta aparecerá aqui com todo carinho.',
    hint: 'Respire fundo e compartilhe o que sentir no peito.'
  });

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);

  const [customCat, setCustomCat] = useState('n1');
  const [customText, setCustomText] = useState('');
  const [customHint, setCustomHint] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sem_armadura_custom_cards');
      if (saved) {
        setCustomCards(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Erro ao carregar cartas personalizadas:", e);
    }
  }, []);

  const getAllCards = () => [...baseCards, ...customCards];

  const initDeck = (cat = currentCategory, cards = getAllCards()) => {
    const filtered = cat === 'all' ? cards : cards.filter(c => c.category === cat);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setAvailableDeck(shuffled);
    setDrawnCount(0);
    return shuffled;
  };

  useEffect(() => {
    initDeck(currentCategory);
  }, [customCards]);

  const triggerConfetti = () => {
    if (typeof window !== 'undefined' && (window as any).confetti) {
      (window as any).confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#FFD1DC', '#FFB7B2', '#E2D4F0', '#C5E3F6', '#FFF3B0']
      });
    }
  };

  const drawCard = () => {
    let deck = [...availableDeck];
    if (deck.length === 0) {
      deck = initDeck(currentCategory);
      triggerConfetti();
    }

    const card = deck.pop();
    if (!card) return;

    setAvailableDeck(deck);
    setDrawnCount(prev => prev + 1);
    setCurrentCard(card);

    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCurrentCategory(cat);
    const newDeck = initDeck(cat);

    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        if (newDeck.length > 0) {
          const card = newDeck.pop();
          if (card) {
            setAvailableDeck(newDeck);
            setDrawnCount(1);
            setCurrentCard(card);
            setIsFlipped(true);
          }
        }
      }, 350);
    }
  };

  const resetDeck = () => {
    initDeck(currentCategory);
    triggerConfetti();
    setIsFlipped(false);
  };

  const handleSaveCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryLabels: Record<string, string> = {
      'n1': '🌸 Nível 1 • Esquenta',
      'n2': '🧸 Nível 2 • Vulnerável',
      'n3': '☁️ Nível 3 • Raízes',
      'action': '🎲 Dinâmica'
    };

    const newCard: Card = {
      category: customCat,
      label: categoryLabels[customCat] || '✨ Personalizada',
      icon: '✍️',
      text: customText,
      hint: customHint || 'Carta especial criada por você 💖'
    };

    const updated = [...customCards, newCard];
    setCustomCards(updated);
    localStorage.setItem('sem_armadura_custom_cards', JSON.stringify(updated));

    setCustomText('');
    setCustomHint('');
    setIsCustomModalOpen(false);
    triggerConfetti();
    handleCategoryChange(customCat);
  };

  const totalCardsCount = currentCategory === 'all'
    ? getAllCards().length
    : getAllCards().filter(c => c.category === currentCategory).length;

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="afterInteractive" />
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet" />

      <style jsx global>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        body {
          font-family: 'Quicksand', sans-serif;
          background: linear-gradient(135deg, #FFF9F2 0%, #FFE5EC 40%, #E8F1F5 80%, #F3E8FF 100%);
          background-attachment: fixed;
          touch-action: manipulation;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }
        .card-inner.is-flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 1.5rem;
        }
        .card-back {
          transform: rotateY(180deg);
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .pastel-mesh {
          background-image: 
            radial-gradient(at 10% 20%, rgba(255, 209, 220, 0.5) 0px, transparent 50%),
            radial-gradient(at 90% 10%, rgba(226, 212, 240, 0.5) 0px, transparent 50%),
            radial-gradient(at 50% 90%, rgba(197, 227, 246, 0.5) 0px, transparent 50%);
        }
      `}</style>

      <div className="flex flex-col text-zinc-700 select-none min-h-screen">
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-70">
          <div className="absolute top-4 left-4 text-pink-300 animate-float text-xl">🌸</div>
          <div className="absolute top-16 right-6 text-purple-300 animate-float text-2xl" style={{ animationDelay: '1s' }}>☁️️</div>
          <div className="absolute bottom-20 left-6 text-blue-300 animate-float text-xl" style={{ animationDelay: '2s' }}>🧸</div>
          <div className="absolute bottom-10 right-4 text-amber-300 animate-float text-xl" style={{ animationDelay: '1.5s' }}>✨</div>
        </div>

        <div className="relative z-10 w-full min-h-screen max-w-md mx-auto p-3 sm:p-4 flex flex-col justify-between box-border">

          {/* Header */}
          <header className="text-center pt-1 pb-2 flex-shrink-0">
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/80 border border-pink-200/80 shadow-sm backdrop-blur-md mb-1 animate-bounce-gentle">
              <span className="text-xs">🎀</span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-400 font-display">Cartas de Afeto & Vulnerabilidade</span>
              <span className="text-xs">✨</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-rose-500 tracking-tight drop-shadow-sm flex items-center justify-center gap-1.5">
               Nós em Nós - um baralho sobre afeto e nós que a gente desata💖
            </h1>
            <p className="text-[11px] sm:text-xs text-rose-900/60 font-medium mt-0.5">Um espaço seguro para trocas sinceras e afetivas</p>
          </header>

          {/* Nav Categorias */}
          <nav className="my-1.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5">
              {[
                { id: 'all', label: 'Todos', icon: '✨', activeClass: 'bg-rose-400 text-white shadow-rose-200 scale-105' },
                { id: 'n1', label: 'Nível 1', icon: '🌸', activeClass: 'bg-rose-400 text-white shadow-pink-200 scale-105' },
                { id: 'n2', label: 'Nível 2', icon: '🧸', activeClass: 'bg-purple-400 text-white shadow-purple-200 scale-105' },
                { id: 'n3', label: 'Nível 3', icon: '☁️', activeClass: 'bg-sky-400 text-white shadow-sky-200 scale-105' },
                { id: 'action', label: 'Ação', icon: '🎲', activeClass: 'bg-emerald-400 text-white shadow-emerald-200 scale-105' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleCategoryChange(item.id)}
                  className={`cat-btn px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 whitespace-nowrap ${
                    currentCategory === item.id
                      ? item.activeClass
                      : 'bg-white/90 text-rose-700 hover:bg-rose-100 border border-pink-200'
                  }`}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Main Content / Card */}
          <main className="flex-1 my-2 flex items-center justify-center min-h-[300px] max-h-[50vh] sm:max-h-[420px]">
            <div className="perspective-1000 w-full h-full cursor-pointer" onClick={drawCard}>
              <div className={`card-inner shadow-cute-lg ${isFlipped ? 'is-flipped' : ''}`}>
                
                {/* Frente */}
                <div className="card-front bg-gradient-to-br from-white via-pink-50/90 to-purple-50/90 border-4 border-white p-4 sm:p-5 flex flex-col justify-between items-center text-center pastel-mesh relative overflow-hidden">
                  <div className="absolute inset-1.5 border-2 border-dashed border-pink-200/60 rounded-2xl pointer-events-none"></div>

                  <div className="w-full flex justify-between items-center z-10">
                    <span className="text-base">🎀</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 font-display bg-white/90 px-2.5 py-0.5 rounded-full border border-pink-100">Baralho do Afeto</span>
                    <span className="text-base">✨</span>
                  </div>

                  <div className="z-10 my-auto flex flex-col items-center py-2">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-pink-200 to-purple-200 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-inner mb-3 animate-bounce-gentle">
                      💌
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-rose-500 mb-1">Pronto para Conectar?</h2>
                    <p className="text-xs text-zinc-500 max-w-[200px] font-medium leading-relaxed">
                      Toque no card para tirar a sua primeira carta!
                    </p>
                  </div>

                  <div className="z-10 bg-white/90 px-3.5 py-1 rounded-full border border-pink-100 text-[11px] text-rose-400 font-bold font-display shadow-sm">
                    Clique para abrir 💖
                  </div>
                </div>

                {/* Verso */}
                <div className="card-back bg-gradient-to-br from-white via-amber-50/50 to-pink-50/60 border-4 border-white p-4 sm:p-5 flex flex-col justify-between text-center relative overflow-hidden">
                  <div className="absolute inset-1.5 border-2 border-pink-200/50 rounded-2xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center z-10">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 border border-rose-200/60 font-display flex items-center gap-1">
                      {currentCard.label}
                    </span>
                    <div className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full border border-pink-100">
                      <span className="text-[11px] text-rose-400 font-bold font-display">
                        {drawnCount} / {totalCardsCount}
                      </span>
                    </div>
                  </div>

                  <div className="my-auto py-2 z-10 flex flex-col items-center justify-center px-2 overflow-y-auto max-h-[70%]">
                    <span className="text-2xl sm:text-3xl mb-2 flex-shrink-0">{currentCard.icon}</span>
                    <p className="text-base sm:text-lg font-display font-semibold leading-relaxed text-zinc-800 whitespace-pre-line">
                      {currentCard.text}
                    </p>
                  </div>

                  <div className="z-10 pt-2 border-t border-pink-100/80 flex flex-col items-center gap-0.5 flex-shrink-0">
                    <p className="text-[11px] sm:text-xs text-rose-900/60 font-medium italic">
                      {currentCard.hint}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </main>

          {/* Footer Botoes */}
          <footer className="my-2 flex flex-col gap-2 z-10 flex-shrink-0">
            <button onClick={drawCard} className="w-full py-3 px-5 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white font-display font-bold text-sm sm:text-base rounded-2xl shadow-cute transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-white/60">
              <span>Tirar Próxima Carta</span>
              <span className="text-base">✨</span>
            </button>

            <div className="flex items-center justify-between gap-1.5">
              <button onClick={resetDeck} className="flex-1 py-2 px-2.5 bg-white/90 hover:bg-white text-rose-600 text-xs font-bold rounded-xl border border-pink-200/80 shadow-sm transition active:scale-95 flex items-center justify-center gap-1">
                <span>❤️</span> Embaralhar
              </button>

              <button onClick={() => setIsCustomModalOpen(true)} className="flex-1 py-2 px-2.5 bg-white/90 hover:bg-white text-purple-600 text-xs font-bold rounded-xl border border-purple-200/80 shadow-sm transition active:scale-95 flex items-center justify-center gap-1">
                <span>✍️</span> Criar Carta
              </button>

              <button onClick={() => setIsTherapyModalOpen(true)} className="flex-1 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200/80 shadow-sm transition active:scale-95 flex items-center justify-center gap-1">
                <span>🌱</span> Terapia POA
              </button>
            </div>
          </footer>
        </div>

        {/* Modal Criar Carta */}
        {isCustomModalOpen && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-5 max-w-sm w-full border-4 border-white shadow-cute-lg flex flex-col gap-3 relative animate-bounce-gentle">
              
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold font-display text-rose-500 flex items-center gap-1.5">
                  <span>✍️</span> Nova Carta Afetiva
                </h3>
                <button onClick={() => setIsCustomModalOpen(false)} className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 font-bold flex items-center justify-center hover:bg-rose-200 transition text-xs">
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-zinc-500 leading-tight">Escreva suas próprias perguntas sinceras. Elas serão salvas no seu dispositivo!</p>

              <form onSubmit={handleSaveCustomCard} className="flex flex-col gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-rose-700 font-display block mb-0.5">Categoria:</label>
                  <select value={customCat} onChange={(e) => setCustomCat(e.target.value)} className="w-full bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-300">
                    <option value="n1">🌸 Nível 1: Esquenta</option>
                    <option value="n2">🧸 Nível 2: Vulnerável</option>
                    <option value="n3">☁️ Nível 3: Raízes & Afetos</option>
                    <option value="action">🎲 Dinâmica de Ação</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-rose-700 font-display block mb-0.5">Sua Pergunta / Provocação:</label>
                  <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} required rows={2.5} placeholder="Ex: Qual foi a última conversa que mudou o seu dia?" className="w-full bg-white border border-pink-200 rounded-xl p-2.5 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"></textarea>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-rose-700 font-display block mb-0.5">Dica Afetiva (opcional):</label>
                  <input value={customHint} onChange={(e) => setCustomHint(e.target.value)} type="text" placeholder="Ex: Responda sem pensar muito." className="w-full bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-300" />
                </div>

                <button type="submit" className="w-full mt-1 py-2.5 bg-rose-400 hover:bg-rose-500 text-white font-display font-bold text-xs rounded-xl shadow-cute transition active:scale-95">
                  Salvar Carta no Baralho 💖
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Terapia POA */}
        {isTherapyModalOpen && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-gradient-to-br from-white via-emerald-50/50 to-teal-50 rounded-3xl p-4 sm:p-5 max-w-md w-full border-4 border-white shadow-cute-lg flex flex-col gap-3 max-h-[85vh] relative overflow-hidden">
              
              <div className="flex justify-between items-center pb-2 border-b border-emerald-100 flex-shrink-0">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-display">Cuidado & Acolhimento</span>
                  <h3 className="text-base sm:text-lg font-extrabold font-display text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <span>🌱</span> Terapia a Baixo Custo em POA
                  </h3>
                </div>
                <button onClick={() => setIsTherapyModalOpen(false)} className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center hover:bg-emerald-200 transition text-xs">
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed font-medium bg-white/80 p-2.5 rounded-2xl border border-emerald-100/80">
                Pedir ajuda também é um ato de coragem e amor-próprio. Mapeamos espaços sociais e clínicas-escola em Porto Alegre que oferecem escuta qualificada gratuita ou com valor social simbólico:
              </p>

              <div className="overflow-y-auto space-y-2.5 pr-1 text-xs">
                <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200/70 shadow-sm flex flex-col gap-1 hover:border-emerald-300 transition">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-emerald-800 font-display text-sm">🏛️ Clínica-Escola de Psicologia UFRGS</h4>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Gratuito / Social</span>
                  </div>
                  <p className="text-zinc-600 text-[11px]">Atendimento individual, em grupo e acompanhamento psicológico público.</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 mt-1 font-semibold">
                    <span>📍 Campus Saúde / Santana</span>
                    <span>📞 (51) 3308-5000</span>
                  </div>
                </div>

                <div className="bg-white/90 p-3 rounded-2xl border border-pink-200/70 shadow-sm flex flex-col gap-1 hover:border-pink-300 transition">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-rose-800 font-display text-sm">🌸 Serviço de Atendimento Psicológico PUCRS</h4>
                    <span className="bg-pink-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Valor Social</span>
                  </div>
                  <p className="text-zinc-600 text-[11px]">Avaliação por triagem socioeconômica com consultas acessíveis.</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 mt-1 font-semibold">
                    <span>📍 Av. Ipiranga, Partenon</span>
                    <span>📞 (51) 3320-3500</span>
                  </div>
                </div>

                <div className="bg-white/90 p-3 rounded-2xl border border-purple-200/70 shadow-sm flex flex-col gap-1 hover:border-purple-300 transition">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-purple-800 font-display text-sm">🧸 Centro Integrado de Saúde IPA</h4>
                    <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Acessível</span>
                  </div>
                  <p className="text-zinc-600 text-[11px]">Acolhimento psicoterapêutico por estudantes supervisionados por docentes.</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 mt-1 font-semibold">
                    <span>📍 Bairro Rio Branco</span>
                    <span>📞 (51) 3316-1100</span>
                  </div>
                </div>

                <div className="bg-white/90 p-3 rounded-2xl border border-sky-200/70 shadow-sm flex flex-col gap-1 hover:border-sky-300 transition">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sky-800 font-display text-sm">☁️ Clínica de Psicologia ULBRA / Projetos</h4>
                    <span className="bg-sky-100 text-sky-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Gratuito / Social</span>
                  </div>
                  <p className="text-zinc-600 text-[11px]">Psicoterapia individual para adolescentes, adultos e idosos da região metropolitana.</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 mt-1 font-semibold">
                    <span>📍 Porto Alegre & Canoas</span>
                    <span>📞 (51) 3477-4000</span>
                  </div>
                </div>

                <div className="bg-emerald-100/60 p-3 rounded-2xl border border-emerald-300/80 shadow-sm flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-emerald-900 font-display text-sm">🏥 Unidade de Saúde (UBS/US) e CAPS / SUS</h4>
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">100% Gratuito</span>
                  </div>
                  <p className="text-emerald-950 text-[11px]">Procure o Posto de Saúde de referência do seu bairro para acolhimento e encaminhamento à Rede de Atenção Psicossocial (RAPS).</p>
                </div>

                <div className="bg-rose-100/70 p-3 rounded-2xl border border-rose-300 text-center">
                  <p className="font-bold text-rose-800 text-[11px] font-display">Precisa conversar com alguém agora mesmo?</p>
                  <p className="text-[10px] text-rose-900 mt-0.5">Ligue para o <strong>CVV (Centro de Valorização da Vida)</strong> pelo telefone <strong>188</strong> (Ligação gratuita 24h).</p>
                </div>
              </div>

              <button onClick={() => setIsTherapyModalOpen(false)} className="w-full mt-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-xs rounded-xl shadow-cute transition active:scale-95 flex-shrink-0">
                Entendi, cuidar do meu coração 💖
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}