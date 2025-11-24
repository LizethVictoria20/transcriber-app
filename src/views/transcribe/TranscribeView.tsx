// Agrega esta declaración para que TypeScript reconozca import.meta.env
declare global {
  interface ImportMeta {
    env: {
      VITE_API_KEY: string;
    };
  }
}

import React, { useState, useMemo, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GoogleGenAI } from "@google/genai";
import { dbService } from "../../services/database";
import type { TranscriptionItem, Prompts, ApiKeys } from "../../types";
import {
  HiOutlineDocumentText,
  HiOutlineCloudArrowUp,
  HiOutlineCheckCircle,
  HiSparkles,
  HiOutlineQueueList,
  HiOutlinePlay,
} from "react-icons/hi2";

interface TranscribeViewProps {
  onTranscriptionComplete: (transcription: TranscriptionItem) => void;
  apiKeys: ApiKeys;
  prompts: Prompts;
}

export default function TranscribeView({
  onTranscriptionComplete,
  apiKeys,
  prompts,
}: TranscribeViewProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSelection, setPageSelection] = useState("");
  const [transcriptionName, setTranscriptionName] = useState("");
  const [transcribeAll, setTranscribeAll] = useState(false);
  const [translateMode, setTranslateMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);

  // --- HANDLERS ---
  const handleFileChange = async (file: File | null) => {
    if (file && file.type === "application/pdf") {
      setIsReadingFile(true);
      setError("");
      setPdfFile(file);
      setTranscriptionName(file.name.replace(/\.[^/.]+$/, ""));
      setPageImages([]);
      setPageSelection("");
      setTranscribeAll(false);
      setTranslateMode(false);
      setTotalPages(0);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const typedarray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        setTotalPages(pdf.numPages);

        const images: string[] = [];
        const numPreviewPages = Math.min(pdf.numPages, 20);
        for (let i = 1; i <= numPreviewPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas,
          }).promise;
          images.push(canvas.toDataURL("image/jpeg"));
        }
        setPageImages(images);
      } catch (err) {
        console.error("Error processing PDF:", err);
        setError("No se pudo procesar el archivo PDF.");
        setPdfFile(null);
      } finally {
        setIsReadingFile(false);
      }
    } else if (file) {
      setError("Por favor, selecciona un archivo PDF válido.");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const parsePageSelection = (): number[] => {
    if (transcribeAll)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>();
    const parts = pageSelection.split(",");
    for (const part of parts) {
      const trimmedPart = part.trim();
      if (trimmedPart.includes("-")) {
        const [start, end] = trimmedPart.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++)
            if (i > 0 && i <= totalPages) pages.add(i);
        }
      } else {
        const pageNum = Number(trimmedPart);
        if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages)
          pages.add(pageNum);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const pagesToTranscribe = useMemo(parsePageSelection, [
    pageSelection,
    transcribeAll,
    totalPages,
  ]);

  useEffect(() => {
    if (pagesToTranscribe.length === 0) {
      setEstimatedCost(null);
      return;
    }
    const numPages = pagesToTranscribe.length;
    let cost = 0;
    if (provider === "gemini") {
      cost = numPages * 0.000125;
      setEstimatedCost(`$${cost.toFixed(4)}`);
    } else {
      cost = numPages * (850 / 1000000) * 5;
      setEstimatedCost(`$${cost.toFixed(3)} (Est.)`);
    }
  }, [pagesToTranscribe, provider]);

  const handleTranscribe = async () => {
    if (!pdfFile || pagesToTranscribe.length === 0) {
      setError("Selecciona un PDF y especifica las páginas.");
      return;
    }
    if (provider === "openai" && !apiKeys.openai) {
      setError(`Configura tu API Key de OpenAI.`);
      return;
    }

    setIsProcessing(true);
    setError("");
    setProgress(0);

    try {
      let fullTranscription = "";
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
      const prompt = translateMode
        ? prompts.transcriptionTranslate
        : prompts.transcription;

      for (let i = 0; i < pagesToTranscribe.length; i++) {
        const pageNum = pagesToTranscribe[i];
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas,
        }).promise;

        const base64ImageData = canvas.toDataURL("image/jpeg").split(",")[1];
        const dataUrl = canvas.toDataURL("image/jpeg");
        let transcription = "";

        if (provider === "gemini") {
          const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
          const imagePart = {
            inlineData: { data: base64ImageData, mimeType: "image/jpeg" },
          };
          const textPart = { text: prompt };
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: { parts: [imagePart, textPart] },
          });
          transcription = response.text || "";
        } else {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKeys.openai}`,
              },
              body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: prompt },
                      { type: "image_url", image_url: { url: dataUrl } },
                    ],
                  },
                ],
                max_tokens: 4096,
              }),
            }
          );
          if (!response.ok) throw new Error("Error OpenAI API");
          const data = await response.json();
          transcription = data.choices[0].message.content;
        }

        fullTranscription += `--- PÁGINA ${pageNum} ---\n\n${transcription}\n\n`;
        setProgress(((i + 1) / pagesToTranscribe.length) * 100);
      }

      await dbService.createTranscription(
        {
          name: transcriptionName || pdfFile.name,
          fileName: pdfFile.name,
          pages: transcribeAll ? "Todas" : pageSelection,
          pageCount: pagesToTranscribe.length,
          originalPageCount: totalPages,
          provider: provider,
          transcription: fullTranscription,
          tags: [],
        },
        pdfFile
      );

      onTranscriptionComplete({} as TranscriptionItem);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error desconocido");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setPdfFile(null);
    setPageImages([]);
    setEstimatedCost(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Nueva Transcripción
            </h2>
            <p className="text-slate-500 mt-1">
              Carga tu documento y configura la IA.
            </p>
          </div>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          {isProcessing && (
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-sm text-center">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Transcribiendo...
                </h3>
                <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                  <span>Progreso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Por favor no cierres esta ventana.
                </p>
              </div>
            </div>
          )}

          {!pdfFile && !isReadingFile && (
            <div className="p-8 md:p-12">
              <div
                className={`group relative border-2 border-dashed rounded-3xl h-80 flex flex-col items-center justify-center text-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
      ${
        isDragging
          ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100 scale-[1.01]"
          : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5"
      }`}
                onDrop={handleDrop}
                onDragOver={handleDragEvents}
                onDragEnter={handleDragEvents}
                onDragLeave={handleDragEvents}
                onClick={() =>
                  (
                    document.getElementById("file-input") as HTMLInputElement
                  ).click()
                }
              >
                <input
                  type="file"
                  id="file-input"
                  accept="application/pdf"
                  onChange={(e) =>
                    handleFileChange(e.target.files ? e.target.files[0] : null)
                  }
                  className="hidden"
                />

                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-blue-100/50 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-blue-100/50 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 mb-6 group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <HiOutlineCloudArrowUp className="w-10 h-10 text-slate-400 group-hover:text-blue-600 transition-colors duration-300 relative z-10" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-2 bg-slate-200/50 rounded-full blur-sm group-hover:bg-blue-200/50 transition-colors"></div>
                </div>

                <div className="relative z-10 space-y-2">
                  <p className="text-xl font-bold text-slate-900">
                    <span className="text-blue-600 hover:underline decoration-2 underline-offset-2">
                      Haz clic para subir
                    </span>{" "}
                    o arrastra y suelta
                  </p>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                    Sube tus expedientes judiciales o documentos legales en
                    formato PDF.
                  </p>
                </div>

                <div className="relative z-10 mt-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    PDF • Máx. 50MB
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. LOADER DE LECTURA */}
          {isReadingFile && (
            <div className="p-32 text-center">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-lg font-bold text-slate-900">
                Analizando Documento...
              </h3>
              <p className="text-slate-500">Preparando vista previa</p>
            </div>
          )}

          {/* 3. FORMULARIO CONFIGURACIÓN */}
          {pdfFile && !isReadingFile && (
            <div className="p-8">
              {/* A. Info Archivo */}
              <div className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 text-red-500 shadow-sm">
                    <HiOutlineDocumentText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {pdfFile.name}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                      {totalPages} Páginas
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* B. FORMULARIO OPTIMIZADO */}
              <div className="space-y-8">
                <div className="mb-8 space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
                      1. Configuración del Expediente
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                          Nombre del Caso
                        </label>
                        <input
                          type="text"
                          value={transcriptionName}
                          onChange={(e) => setTranscriptionName(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                          placeholder="Ej: Caso 5402 - Declaración Testimonial"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                          Alcance de lectura
                        </label>
                        <div className="p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1 shrink-0">
                              <button
                                onClick={() => setTranscribeAll(true)}
                                className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-md transition-all ${
                                  transcribeAll
                                    ? "bg-slate-800 text-white shadow-md"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                              >
                                Todas ({totalPages})
                              </button>
                              <button
                                onClick={() => setTranscribeAll(false)}
                                className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-md transition-all ${
                                  !transcribeAll
                                    ? "bg-slate-800 text-white shadow-md"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                              >
                                Manual
                              </button>
                            </div>
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                disabled={transcribeAll}
                                value={transcribeAll ? "" : pageSelection}
                                onChange={(e) =>
                                  setPageSelection(e.target.value)
                                }
                                placeholder={
                                  transcribeAll
                                    ? "Documento completo"
                                    : "Ej: 1-3, 5"
                                }
                                className={`w-full h-full min-h-[46px] px-4 text-sm border-none bg-transparent focus:ring-0 outline-none rounded-lg ${
                                  transcribeAll
                                    ? "text-slate-400 italic cursor-not-allowed text-center"
                                    : "text-slate-900 font-bold bg-white border border-slate-200 shadow-inner"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- INTELIGENCIA ARTIFICIAL --- */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <HiSparkles className="w-5 h-5 text-blue-600" />
                      2. Configuración de Procesamiento
                    </h3>

                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                            Motor de IA
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setProvider("gemini")}
                              className={`relative flex flex-col items-center justify-center py-3 px-4 rounded-xl border-2 transition-all ${
                                provider === "gemini"
                                  ? "bg-white border-blue-500 text-blue-700 shadow-md ring-1 ring-blue-500/20"
                                  : "bg-white border-transparent text-slate-500 hover:border-slate-200 shadow-sm"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-bold">
                                  Gemini
                                </span>
                                <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                                  Rápido
                                </span>
                              </div>
                              <span className="text-[10px] opacity-60">
                                Ideal para borradores
                              </span>
                              {provider === "gemini" && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </button>

                            <button
                              onClick={() => setProvider("openai")}
                              className={`relative flex flex-col items-center justify-center py-3 px-4 rounded-xl border-2 transition-all ${
                                provider === "openai"
                                  ? "bg-white border-blue-500 text-blue-700 shadow-md ring-1 ring-blue-500/20"
                                  : "bg-white border-transparent text-slate-500 hover:border-slate-200 shadow-sm"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-bold">
                                  GPT-4o
                                </span>
                                <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                                  Preciso
                                </span>
                              </div>
                              <span className="text-[10px] opacity-60">
                                Ideal para contratos
                              </span>
                              {provider === "openai" && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                            Opciones Adicionales
                          </label>
                          <label className="flex items-center gap-4 px-5 py-3.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-all shadow-sm h-[76px] group">
                            <div
                              className={`w-6 h-6 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                translateMode
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-slate-300 bg-slate-50 group-hover:bg-white"
                              }`}
                            >
                              {translateMode && (
                                <HiOutlineCheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={translateMode}
                              onChange={(e) =>
                                setTranslateMode(e.target.checked)
                              }
                              className="hidden"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                                Traducir al Español
                              </span>
                              <span className="text-[11px] text-slate-400 mt-0.5">
                                Detecta el idioma original y traduce la salida.
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                      <span className="font-medium">Páginas:</span>{" "}
                      {pagesToTranscribe.length}
                    </div>
                    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
                      <span className="font-medium">Costo Est.:</span>{" "}
                      <span className="font-bold">
                        {estimatedCost || "$0.00"}
                      </span>
                    </div>
                  </div>
                </div>

                {pageImages.length > 0 && (
                  <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <HiOutlineQueueList className="w-4 h-4" />
                        Vista Previa ({pagesToTranscribe.length} Seleccionadas)
                      </h4>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                      {pageImages.map((src, index) => {
                        const pageNum = index + 1;
                        const isSelected = pagesToTranscribe.includes(pageNum);
                        return (
                          <div
                            key={index}
                            className={`relative aspect-3/4 rounded-lg overflow-hidden border transition-all cursor-default ${
                              isSelected
                                ? "border-blue-500 ring-2 ring-blue-500/20 opacity-100 shadow-sm transform scale-105 z-10"
                                : "border-slate-200 opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
                            }`}
                          >
                            <img
                              src={src}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5 font-medium">
                              Pág {pageNum}
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                                <HiOutlineCheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Botón Acción */}
                <button
                  onClick={handleTranscribe}
                  disabled={isProcessing || pagesToTranscribe.length === 0}
                  className="px-8 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none w-full md:w-auto justify-center transform active:scale-95"
                >
                  <HiOutlinePlay className="w-5 h-5" />
                  <span>Iniciar Transcripción</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 text-center font-medium animate-pulse">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
