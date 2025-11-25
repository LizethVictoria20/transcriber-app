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
import type { TranscriptionItem } from "./HistoryView";
import type { Prompts } from "./types";
import { storeFile } from "./fileStorage";

interface ApiKeys {
  openai: string;
}

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
        const numPreviewPages = Math.min(pdf.numPages, 20); // Limit preview to 20 pages for performance
        for (let i = 1; i <= numPreviewPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          // FIX: Add 'canvas' property to render parameters to satisfy TypeScript types.
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
        setError(
          "No se pudo procesar el archivo PDF. Asegúrate de que no esté dañado."
        );
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
    if (transcribeAll) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    const parts = pageSelection.split(",");
    for (const part of parts) {
      const trimmedPart = part.trim();
      if (trimmedPart.includes("-")) {
        const [start, end] = trimmedPart.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i > 0 && i <= totalPages) pages.add(i);
          }
        }
      } else {
        const pageNum = Number(trimmedPart);
        if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
          pages.add(pageNum);
        }
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
    let costMessage = "";

    if (provider === "gemini") {
      // Pricing for gemini-2.5-flash is approx. $0.000125 per image
      cost = numPages * 0.000125;
      costMessage = `$${cost.toFixed(6)}`;
    } else {
      // openai
      // Pricing for gpt-4o image input (high detail): ~850 tokens/image @ $5/1M tokens
      cost = numPages * (850 / 1000000) * 5;
      costMessage = `$${cost.toFixed(6)} (Estimado)`;
    }

    setEstimatedCost(costMessage);
  }, [pagesToTranscribe, provider]);

  const handleTranscribe = async () => {
    if (!pdfFile || pagesToTranscribe.length === 0) {
      setError(
        "Por favor, selecciona un PDF y especifica las páginas a transcribir."
      );
      return;
    }

    if (provider === "openai" && !apiKeys.openai) {
      setError(
        `Por favor, introduce tu clave API de OpenAI en la sección de Configuración.`
      );
      return;
    }

    setIsProcessing(true);
    setError("");
    setProgress(0);

    const transcriptionId = Date.now();

    try {
      let fullTranscription = "";
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;

      // Select prompt based on translate mode
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
        // FIX: Add 'canvas' property to render parameters to satisfy TypeScript types.
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
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
          });

          transcription = response.text || "";
        } else {
          // OpenAI
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

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Error de la API de OpenAI: ${errorData.error.message}`
            );
          }

          const data = await response.json();
          transcription = data.choices[0].message.content;
        }

        fullTranscription += `--- PÁGINA ${pageNum} ---\n\n${transcription}\n\n`;
        setProgress(((i + 1) / pagesToTranscribe.length) * 100);
      }

      // Store original file to IndexedDB
      await storeFile(transcriptionId, pdfFile);

      onTranscriptionComplete({
        id: transcriptionId,
        name: transcriptionName || pdfFile.name,
        fileName: pdfFile.name,
        pages: transcribeAll ? "Todas" : pageSelection,
        pageCount: pagesToTranscribe.length,
        originalPageCount: totalPages,
        provider: provider,
        transcription: fullTranscription,
        date: new Date().toLocaleString(),
      });
    } catch (err: any) {
      console.error("Error during transcription:", err);
      const errorMessage = err.message || "Error desconocido";
      setError(`Ocurrió un error: ${errorMessage}`);

      // Save failed attempt if we have the file info
      if (pdfFile) {
        await storeFile(transcriptionId, pdfFile);
        onTranscriptionComplete({
          id: transcriptionId,
          name: transcriptionName || pdfFile.name,
          fileName: pdfFile.name,
          pages: transcribeAll ? "Todas" : pageSelection,
          pageCount: pagesToTranscribe.length,
          originalPageCount: totalPages,
          provider: provider,
          transcription: "", // Empty transcription on error
          date: new Date().toLocaleString(),
          error: errorMessage,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transcribir Documento</h2>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragEvents}
        onDragEnter={handleDragEvents}
        onDragLeave={handleDragEvents}
        onClick={() =>
          !isReadingFile &&
          (document.getElementById("file-input") as HTMLInputElement).click()
        }
      >
        <input
          type="file"
          id="file-input"
          accept="application/pdf"
          onChange={(e) =>
            handleFileChange(e.target.files ? e.target.files[0] : null)
          }
          style={{ display: "none" }}
          disabled={isReadingFile}
        />
        {isReadingFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Procesando PDF...</span>
          </div>
        ) : (
          <p className="text-gray-600">
            Arrastra y suelta un archivo PDF aquí, o haz clic para seleccionar
            uno.
          </p>
        )}
      </div>

      {pdfFile && !isReadingFile && (
        <>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
            <strong className="text-gray-900">Archivo:</strong>{" "}
            <span className="text-gray-700">
              {pdfFile.name} ({totalPages} páginas)
            </span>
          </div>
          {pageImages.length > 0 && (
            <div className="mt-6 max-h-96 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 p-4 border border-gray-200 rounded-lg">
              {pageImages.map((src, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded overflow-hidden relative"
                >
                  <img
                    src={src}
                    alt={`Página ${index + 1}`}
                    className="w-full h-auto block"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="transcription-name"
                className="text-sm font-medium text-gray-700"
              >
                Nombre de la Transcripción
              </label>
              <input
                type="text"
                id="transcription-name"
                value={transcriptionName}
                onChange={(e) => setTranscriptionName(e.target.value)}
                placeholder="Ej: Resumen de reunión"
                disabled={isProcessing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Proveedor de Transcripción
              </label>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    provider === "gemini"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setProvider("gemini")}
                >
                  Google Gemini
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    provider === "openai"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setProvider("openai")}
                >
                  OpenAI GPT-4o
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="page-selection"
                className="text-sm font-medium text-gray-700"
              >
                Páginas a transcribir (ej: 1-3, 5, 8):
              </label>
              <input
                type="text"
                id="page-selection"
                value={pageSelection}
                onChange={(e) => setPageSelection(e.target.value)}
                disabled={transcribeAll || isProcessing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="transcribe-all"
                  checked={transcribeAll}
                  onChange={(e) => setTranscribeAll(e.target.checked)}
                  disabled={isProcessing}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="transcribe-all"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Transcribir todo el documento
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="translate-mode"
                  checked={translateMode}
                  onChange={(e) => setTranslateMode(e.target.checked)}
                  disabled={isProcessing}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="translate-mode"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Traducción Inglés -{">"} Español
                </label>
              </div>
            </div>

            {estimatedCost && (
              <div className="text-center p-3 mb-2 bg-blue-50 rounded-lg text-sm text-gray-600">
                <strong className="text-gray-900">Costo Estimado:</strong>{" "}
                {estimatedCost}
              </div>
            )}

            <button
              onClick={handleTranscribe}
              disabled={
                isProcessing ||
                !pdfFile ||
                pagesToTranscribe.length === 0 ||
                (provider === "openai" && !apiKeys.openai)
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                "Transcribir"
              )}
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="mt-6 w-full bg-gray-200 rounded-full overflow-hidden h-2.5">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
