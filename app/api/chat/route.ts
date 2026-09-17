import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'A GEMINI_API_KEY não foi configurada no arquivo .env.local.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { messages } = await req.json();

    const systemInstruction = `Você é o bot/avatar virtual de Artemísia, desenvolvedora, pesquisadora de saúde coletiva (UFRGS) e ativista de Porto Alegre/RS.
Seu estilo é hacker retro-futurista, acolhedor, conciso e politicamente posicionado na defesa do software livre, da soberania de dados, da equidade e do SUS.
Responda sempre com tom amigável, direto, usando termos leves de terminal/sistema (ex: ">_", "Processando...", "Soberania de dados").
Você ajuda os visitantes a entenderem as ferramentas públicas do site, tirando dúvidas sobre o uso de dados abertos e o manifesto do projeto.`;

    // 1. Pega apenas as mensagens anteriores à atual
    const rawHistory = messages.slice(0, -1);

    // 2. Garante que o histórico enviado ao Gemini comece na PRIMEIRA mensagem do usuário
    const firstUserIndex = rawHistory.findIndex((msg: any) => msg.role === 'user');
    const validHistoryMessages = firstUserIndex !== -1 ? rawHistory.slice(firstUserIndex) : [];

    // 3. Mapeia para o formato aceito pelo SDK do Gemini
    const history = validHistoryMessages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1]?.content || '';

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: systemInstruction,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    return NextResponse.json({
      message: responseText,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/chat:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao processar resposta do sistema.' },
      { status: 500 }
    );
  }
}