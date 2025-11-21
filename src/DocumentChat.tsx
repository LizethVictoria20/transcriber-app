import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

import type { ApiKeys } from "./types";

interface DocumentChatProps {
  transcriptionText: string;
  provider: "gemini" | "openai";
  apiKeys: ApiKeys;
}

interface Message {
  id: string;
  role: "user" | "model" | "error";
  text: string;
}

export default function DocumentChat({
  transcriptionText,
  provider,
  apiKeys,
}: DocumentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Maintain a ref to the chat session so it persists across renders (solo para Gemini)
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    setMessages([]);
    if (provider === "gemini") {
      // Inicializa chat Gemini
      if (!chatSessionRef.current) {
        try {
          const geminiKey = apiKeys.gemini || import.meta.env.VITE_API_KEY;
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          chatSessionRef.current = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
              systemInstruction: `Eres un asistente inteligente experto en analizar documentos. 
                Tu tarea es responder preguntas basándote EXCLUSIVAMENTE en la siguiente transcripción del documento proporcionada por el usuario.
                Si la respuesta no está en el texto, indícalo claramente. Se amable y preciso.
                \nCONTEXTO DEL DOCUMENTO:\n${transcriptionText}`,
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
    } else if (provider === "openai") {
      // Mensaje de bienvenida para OpenAI
      setMessages([
        {
          id: "init",
          role: "model",
          text: "Hola, puedes preguntarme sobre el documento usando OpenAI.",
        },
      ]);
    }
    // eslint-disable-next-line
  }, [transcriptionText, provider]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let modelMessage: Message | null = null;
      if (provider === "gemini") {
        if (!chatSessionRef.current)
          throw new Error("Chat Gemini no inicializado");
        const result: GenerateContentResponse =
          await chatSessionRef.current.sendMessage({ message: input });
        modelMessage = {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: result.text || "No pude generar una respuesta.",
        };
      } else if (provider === "openai") {
        if (!apiKeys.openai) {
          modelMessage = {
            id: (Date.now() + 1).toString(),
            role: "error",
            text: "No se ha configurado la clave API de OpenAI.",
          };
        } else {
          // Llamada a la API de OpenAI
          const systemPrompt = `Eres un asistente inteligente experto en analizar documentos.\nTu tarea es responder preguntas basándote EXCLUSIVAMENTE en la siguiente transcripción del documento proporcionada por el usuario.\nSi la respuesta no está en el texto, indícalo claramente.\n\nCONTEXTO DEL DOCUMENTO:\n${transcriptionText}`;
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKeys.openai}`,
              },
              body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: input },
                ],
              }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error?.message || "Error en la API de OpenAI"
            );
          }
          const data = await response.json();
          modelMessage = {
            id: (Date.now() + 1).toString(),
            role: "model",
            text:
              data.choices?.[0]?.message?.content ||
              "No pude generar una respuesta.",
          };
        }
      }
      if (modelMessage) setMessages((prev) => [...prev, modelMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "error",
          text:
            error?.message ||
            "Ocurrió un error al conectar con la IA. Por favor intenta de nuevo.",
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
