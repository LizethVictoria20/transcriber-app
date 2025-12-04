import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import {
  HiSparkles,
  HiUser,
  HiPaperAirplane,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { dbService } from "../../services/database";
import type { ChatMessage } from "../../types";

interface DocumentChatProps {
  transcriptionText: string;
  transcriptionId: number;
}

export default function DocumentChat({
  transcriptionText,
  transcriptionId,
}: DocumentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatSessionRef = useRef<Chat | null>(null);

  // Cargar historial guardado (por usuario + transcripción)
  useEffect(() => {
    let cancelled = false;

    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

        chatSessionRef.current = ai.chats.create({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction: `Eres un asistente inteligente experto en analizar documentos. 
                        Tu tarea es responder preguntas basándote EXCLUSIVAMENTE en la siguiente transcripción del documento proporcionada por el usuario.
                        Si la respuesta no está en el texto, indícalo claramente. Se amable y preciso.
                        
                        CONTEXTO DEL DOCUMENTO:
                        ${transcriptionText}`,
          },
        });

        const storedMessages = await dbService.getDocumentChat(transcriptionId);

        if (cancelled) return;

        if (storedMessages && storedMessages.length > 0) {
          setMessages(storedMessages);
        } else {
          setMessages([
            {
              id: "init",
              role: "model",
              text: "Hola, he analizado el documento. ¿Qué información específica necesitas encontrar?",
            },
          ]);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize chat session", error);
        if (!cancelled) {
          setMessages([
            {
              id: "err",
              role: "error",
              text: "Error al inicializar el chat. Verifica tu conexión.",
            },
          ]);
        }
      }
    };

    initChat();

    return () => {
      cancelled = true;
    };
  }, [transcriptionId, transcriptionText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Guardar historial cada vez que cambian los mensajes (tras inicializar)
  useEffect(() => {
    if (!transcriptionId || !isInitialized) return;
    dbService.saveDocumentChat(transcriptionId, messages).catch((err) =>
      console.error("Error saving chat history", err)
    );
  }, [messages, transcriptionId, isInitialized]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result: GenerateContentResponse =
        await chatSessionRef.current.sendMessage({
          message: input,
        });

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: result.text || "No pude generar una respuesta.",
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "error",
          text: "Ocurrió un error al conectar con la IA. Por favor intenta de nuevo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const quickPrompts = [
    "Resume este documento",
    "¿Cuáles son los puntos clave?",
    "Identifica las fechas importantes",
    "Explica la conclusión principal",
  ];

  return (
    <div className="flex flex-col h-[600px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && (
          <div
            className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-fadeIn"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-4">
              <HiOutlineChatBubbleLeftRight className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Chat con tu Documento
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mt-2 mb-8">
              Haz preguntas específicas sobre el contenido de la transcripción.
              La IA analizará el contexto por ti.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="text-xs text-left px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all text-slate-600 font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <HiSparkles className="w-4 h-4 text-purple-600" />
                </div>
              )}

              <div
                className={`max-w-[80%] px-5 py-3.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  isUser
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                    : "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-1">
                  <HiUser className="w-4 h-4 text-blue-700" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
              <HiSparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-slate-200 p-4">
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all shadow-sm">
          <textarea
            className="w-full bg-transparent border-none text-slate-800 text-sm px-3 py-2.5 focus:ring-0 outline-none resize-none max-h-32 placeholder:text-slate-400"
            placeholder="Pregunta algo sobre el documento..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            style={{ minHeight: "44px" }}
          />

          <button
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-0.5"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            title="Enviar mensaje"
          >
            {isLoading ? (
              <span className="block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <HiPaperAirplane className="w-5 h-5 -rotate-45 translate-x-0.5 -translate-y-0.5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          La IA puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  );
}
