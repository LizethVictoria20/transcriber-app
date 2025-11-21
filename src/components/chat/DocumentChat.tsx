import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface DocumentChatProps {
  transcriptionText: string;
}

interface Message {
  id: string;
  role: "user" | "model" | "error";
  text: string;
}

export default function DocumentChat({ transcriptionText }: DocumentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
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

        setMessages([
          {
            id: "init",
            role: "model",
            text: "Hola, he analizado el documento. ¿Qué información específica necesitas encontrar?",
          },
        ]);
      } catch (error) {
        console.error("Failed to initialize chat session", error);
        setMessages([
          {
            id: "err",
            role: "error",
            text: "Error al inicializar el chat. Verifica tu conexión.",
          },
        ]);
      }
    }
  }, [transcriptionText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMessage: Message = {
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

      const modelMessage: Message = {
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

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="message model">
            <span
              className="loader"
              style={{ width: "12px", height: "12px", borderWidth: "2px" }}
            ></span>{" "}
            Escribiendo...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Pregunta sobre el documento..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: "20px", height: "20px" }}
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
