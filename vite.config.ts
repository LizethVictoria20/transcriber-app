import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga variables de entorno desde .env, .env.local, etc.
  // Usamos prefijo vacío ("") para poder leer también GEMINI_API_KEY / OPENAI_API_KEY sin VITE_
  const env = loadEnv(mode, process.cwd(), "");

  // GEMINI
  // Prioridad:
  // 1) GEMINI_API_KEY          -> lo que normalmente pones en .env.local
  // 2) VITE_API_KEY            -> alternativa compatible con Vite
  // 3) VITE_GEMINI_API_KEY     -> otra alternativa
  const geminiApiKey =
    env.GEMINI_API_KEY || env.VITE_API_KEY || env.VITE_GEMINI_API_KEY || "";

  // OPENAI
  // Prioridad:
  // 1) OPENAI_API_KEY
  // 2) VITE_OPENAI_API_KEY
  const openaiApiKey =
    env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || "";

  return {
    plugins: [react(), tailwindcss()],
    define: {
      // ---------- GEMINI ----------
      // Para el código que usa process.env.API_KEY (ej: TranscriptionDetailView)
      "process.env.API_KEY": JSON.stringify(geminiApiKey),
      // Para el código que usa import.meta.env.VITE_API_KEY (ej: TranscribeView, DocumentChat)
      "import.meta.env.VITE_API_KEY": JSON.stringify(geminiApiKey),

      // ---------- OPENAI ----------
      // Para usar en código tipo process.env.OPENAI_API_KEY
      "process.env.OPENAI_API_KEY": JSON.stringify(openaiApiKey),
      // Para usar en código tipo import.meta.env.VITE_OPENAI_API_KEY
      "import.meta.env.VITE_OPENAI_API_KEY": JSON.stringify(openaiApiKey),
    },
  };
});


