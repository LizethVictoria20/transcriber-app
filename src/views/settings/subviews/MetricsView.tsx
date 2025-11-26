import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineChartBar,
  HiOutlineDocumentDuplicate,
  HiOutlineCurrencyDollar,
  HiOutlineServer,
  HiOutlineCpuChip,
  HiSparkles,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import type { TranscriptionItem } from "../../../types";

interface MetricsViewProps {
  transcriptions: TranscriptionItem[];
}

export default function MetricsView({
  transcriptions,
}: MetricsViewProps) {
  const navigate = useNavigate();
  const metrics = useMemo(() => {
    const totalTranscriptions = transcriptions.length;
    if (totalTranscriptions === 0) {
      return null;
    }

    const totalPages = transcriptions.reduce(
      (sum, item) => sum + item.pageCount,
      0
    );

    const transcriptionsByProvider = transcriptions.reduce((acc, item) => {
      acc[item.provider] = (acc[item.provider] || 0) + 1;
      return acc;
    }, {} as Record<"gemini" | "openai", number>);

    const totalCost = transcriptions.reduce((sum, item) => {
      let cost = 0;
      if (item.provider === "gemini") {
        cost = item.pageCount * 0.000125;
      } else {
        // Estimado GPT-4o
        cost = item.pageCount * (850 / 1000000) * 5;
      }
      return sum + cost;
    }, 0);

    const geminiPercent = Math.round(
      ((transcriptionsByProvider.gemini || 0) / totalTranscriptions) * 100
    );
    const openaiPercent = Math.round(
      ((transcriptionsByProvider.openai || 0) / totalTranscriptions) * 100
    );

    return {
      totalTranscriptions,
      totalPages,
      totalCost,
      transcriptionsByProvider,
      geminiPercent,
      openaiPercent,
    };
  }, [transcriptions]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-slate-800">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <button
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors border border-transparent hover:border-slate-200"
          onClick={() => navigate("/settings")}
          title="Volver al menú"
        >
          <HiOutlineArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Métricas y Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Visión general del rendimiento, costos y uso del sistema.
          </p>
        </div>
      </div>

      {!metrics ? (
        /* --- EMPTY STATE --- */
        <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <HiOutlineChartBar className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Sin datos suficientes
          </h3>
          <p className="text-slate-500 max-w-md mt-2">
            Aún no se han realizado transcripciones. Procesa algunos documentos
            para comenzar a visualizar las métricas de rendimiento y costos.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <HiOutlineChartBar className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Volumen
                </span>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">
                  {metrics.totalTranscriptions}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Transcripciones
                </div>
              </div>
            </div>

            {/* Card 2: Páginas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <HiOutlineDocumentDuplicate className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Procesamiento
                </span>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">
                  {metrics.totalPages}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Páginas Analizadas
                </div>
              </div>
            </div>

            {/* Card 3: Costo */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <HiOutlineCurrencyDollar className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Costo Est.
                </span>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">
                  ${metrics.totalCost.toFixed(4)}
                </div>
                <div className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                  Economía estable
                </div>
              </div>
            </div>

            {/* Card 4: Salud Sistema */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                  <HiOutlineServer className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Estado
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div className="text-2xl font-bold text-slate-900">
                    Operativo
                  </div>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Todos los sistemas online
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Barras (Simulado) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HiOutlineCpuChip className="w-5 h-5 text-slate-400" />
                Distribución de Modelos de IA
              </h3>

              {/* Barra de Progreso Visual */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-blue-600">
                    Gemini ({metrics.geminiPercent}%)
                  </span>
                  <span className="text-purple-600">
                    GPT-4o ({metrics.openaiPercent}%)
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${metrics.geminiPercent}%` }}
                  ></div>
                  <div
                    className="h-full bg-purple-500 transition-all duration-1000"
                    style={{ width: `${metrics.openaiPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-blue-50/30">
                  <div className="flex items-center gap-2 mb-2">
                    <HiSparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">
                      Google Gemini
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {metrics.transcriptionsByProvider.gemini || 0}
                  </p>
                  <p className="text-xs text-slate-500">
                    Solicitudes procesadas
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-purple-50/30">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineCpuChip className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-bold text-slate-700">
                      OpenAI GPT-4o
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {metrics.transcriptionsByProvider.openai || 0}
                  </p>
                  <p className="text-xs text-slate-500">
                    Solicitudes procesadas
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HiOutlineExclamationTriangle className="w-5 h-5 text-orange-500" />
                Tasa de Errores
              </h3>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <span className="text-4xl font-bold text-slate-300 mb-2">
                  0%
                </span>
                <p className="text-sm text-slate-500 font-medium">
                  Sin incidentes registrados
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  El sistema de seguimiento de errores detallado está activo
                  pero no ha detectado fallos críticos recientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
