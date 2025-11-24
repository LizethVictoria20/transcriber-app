import React, { useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineLanguage,
  HiOutlineDocumentText,
  HiOutlineTag,
  HiOutlineTableCells,
  HiCheckCircle,
  HiOutlineInformationCircle,
  HiSparkles,
} from "react-icons/hi2";
import type { Prompts, SettingsViewType } from "../../../types";

interface PromptSettingsViewProps {
  prompts: Prompts;
  setPrompts: (prompts: Prompts) => void;
  setSettingsView: (view: SettingsViewType) => void;
}

export default function PromptSettingsView({
  prompts,
  setPrompts,
  setSettingsView,
}: PromptSettingsViewProps) {
  const [localPrompts, setLocalPrompts] = useState<Prompts>(prompts);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setPrompts(localPrompts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderPromptField = (
    id: string,
    label: string,
    value: string,
    fieldKey: keyof Prompts,
    icon: React.ReactNode,
    description?: string,
    variable?: string
  ) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
            {label}
          </h4>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
      </div>

      <textarea
        id={id}
        value={value}
        onChange={(e) =>
          setLocalPrompts({ ...localPrompts, [fieldKey]: e.target.value })
        }
        className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y leading-relaxed"
        placeholder="Escribe las instrucciones para la IA aquí..."
      />

      {variable && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100/50">
          <HiOutlineInformationCircle className="w-4 h-4 text-blue-400" />
          <span>
            Variable dinámica:{" "}
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-100 text-blue-600 font-bold select-all">
              {variable}
            </code>
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-slate-800 relative min-h-screen pb-32">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <button
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors border border-transparent hover:border-slate-200"
          onClick={() => setSettingsView("main")}
          title="Volver al menú"
        >
          <HiOutlineArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cadenas de Prompts
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Ajusta el tono y formato de las respuestas de la IA.
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {/* SECCIÓN 1 */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Procesamiento de Texto
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {renderPromptField(
              "prompt-transcription",
              "Transcripción Estándar",
              localPrompts.transcription,
              "transcription",
              <HiOutlineChatBubbleBottomCenterText className="w-6 h-6" />,
              "Instrucción base para convertir la imagen del documento a texto plano."
            )}

            {renderPromptField(
              "prompt-translate",
              "Traducción (Inglés → Español)",
              localPrompts.transcriptionTranslate,
              "transcriptionTranslate",
              <HiOutlineLanguage className="w-6 h-6" />,
              "Instrucción utilizada cuando se activa el modo 'Traducir al Español'."
            )}
          </div>
        </section>

        {/* SECCIÓN 2 */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Generación de Análisis
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {renderPromptField(
              "prompt-summary",
              "Resumen General del Caso",
              localPrompts.summary,
              "summary",
              <HiOutlineDocumentText className="w-6 h-6" />,
              "Genera la tabla de resumen de temas principales.",
              "[TRANSCRIPTION]"
            )}

            {renderPromptField(
              "prompt-page-summary",
              "Resumen por Página",
              localPrompts.pageSummary,
              "pageSummary",
              <HiOutlineTableCells className="w-6 h-6" />,
              "Genera la tabla desglosada página por página.",
              "[PAGE_CONTENT]"
            )}

            {renderPromptField(
              "prompt-auto-tagging",
              "Etiquetado Inteligente (JSON)",
              localPrompts.autoTagging,
              "autoTagging",
              <HiOutlineTag className="w-6 h-6" />,
              "Debe devolver estrictamente un array JSON de strings para las sugerencias.",
              "[TRANSCRIPTION]"
            )}
          </div>
        </section>
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 pl-5 pr-2 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300">
          <div className="flex items-center">
            {saved ? (
              <span className="flex items-center gap-2 text-emerald-600 text-sm font-semibold animate-fadeIn">
                <HiCheckCircle className="w-5 h-5" />
                <span>Cambios guardados</span>
              </span>
            ) : (
              <span className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <HiSparkles className="w-4 h-4 text-slate-400" />
                <span>Edición activa</span>
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-full shadow-md transition-all transform active:scale-95"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
