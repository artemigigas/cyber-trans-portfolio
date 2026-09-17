'use client';

import { useState } from 'react';
import { Terminal, Send, Bot, User } from 'lucide-react';

export default function CyberChat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Sistema ativo. Sou a versão IA da operadora. Pergunte-me sobre as ferramentas, dados do DATASUS ou sobre o manifesto!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const novaMensagem = { role: 'user' as const, content: input };
    const novasMensagens = [...messages, novaMensagem];

    setMessages(novasMensagens);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: novasMensagens }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erro na resposta da API:', res.status, errorText);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Erro de conexão com a API. Verifique a chave OPENAI_API_KEY no arquivo .env.local.' }
        ]);
        return;
      }

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch (err) {
      console.error('Erro de requisição:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro de comunicação no terminal. Tente novamente.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-cyber-pink/40 bg-black/80 rounded-lg p-4 font-mono shadow-[0_0_15px_rgba(255,0,127,0.1)]">
      <div className="flex items-center gap-2 border-b border-cyber-pink/30 pb-3 mb-4 text-xs text-cyber-pink font-bold">
        <Terminal size={16} /> // ASSISTENTE_VIRTUAL // IA_OPERADORA
      </div>

      {/* Caixa de Conversa */}
      <div className="h-64 overflow-y-auto space-y-3 mb-4 pr-2 text-xs">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 p-2.5 rounded ${
              msg.role === 'user'
                ? 'bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-white ml-6'
                : 'bg-cyber-pink/10 border border-cyber-pink/30 text-cyber-white mr-6'
            }`}
          >
            {msg.role === 'user' ? (
              <User size={14} className="text-cyber-blue shrink-0 mt-0.5" />
            ) : (
              <Bot size={14} className="text-cyber-pink shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="text-cyber-green text-xs flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-ping"></span>
            Processando resposta...
          </div>
        )}
      </div>

      {/* Form de Envio */}
      <form onSubmit={enviarMensagem} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua dúvida ou comando..."
          className="flex-1 bg-black border border-cyber-pink/40 rounded px-3 py-2 text-xs text-cyber-white focus:outline-none focus:border-cyber-pink"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-cyber-pink hover:bg-cyber-pink/80 text-black font-bold px-3 py-2 rounded text-xs flex items-center gap-1 transition-all"
        >
          <Send size={12} /> Send
        </button>
      </form>
    </div>
  );
}