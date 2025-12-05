import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from "jspdf";
import { dbService } from "../../services/database";
import DocumentChat from "../../components/chat/DocumentChat";
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentText,
  HiOutlineDocumentDuplicate,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineTag,
  HiOutlinePencil,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCloudArrowDown,
  HiOutlineTableCells,
  HiSparkles,
  HiXMark,
  HiPlus,
} from "react-icons/hi2";
import type { TranscriptionItem, Prompts, ApiKeys } from "../../types";

interface TranscriptionDetailViewProps {
  item: TranscriptionItem;
  onBack: () => void;
  onUpdateTranscription: (id: number, newText: string) => void;
  onUpdateTags: (id: number, tags: string[]) => void;
  apiKeys: ApiKeys;
  prompts: Prompts;
}

interface TableRow {
  number: number;
  documentName: string;
  isAnnex: string;
  internalPages: string;
  pdfPages: string;
  notes: string;
}

interface PageTableRow {
  page_number: number;
  summary: string;
}

type ViewMode = "editor" | "chat";

export default function TranscriptionDetailView({
  item,
  onBack,
  onUpdateTranscription,
  onUpdateTags,
  apiKeys,
  prompts,
}: TranscriptionDetailViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [generatingTable, setGeneratingTable] = useState(false);
  const [generatedTable, setGeneratedTable] = useState<TableRow[] | null>(null);
  const [generationError, setGenerationError] = useState("");

  const [generatingPageTable, setGeneratingPageTable] = useState(false);
  const [generatedPageTable, setGeneratedPageTable] = useState<
    PageTableRow[] | null
  >(null);
  const [pageTableError, setPageTableError] = useState("");

  // Tagging State
  const [tags, setTags] = useState<string[]>(item.tags || []);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const [isOriginalAvailable, setIsOriginalAvailable] = useState(true); // Assume true for cloud
  const [isDownloadingOriginal, setIsDownloadingOriginal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [htmlContent, setHtmlContent] = useState(
    item.transcription.replace(/\n/g, "<br/>")
  );
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let initialContent = item.transcription;

    if (!/<[a-z][\s\S]*>/i.test(initialContent)) {
      // Reemplazar marcadores de página tipo "--- PÁGINA X (PDF Original: Y) ---" por un banner visual
      const pageMarkerRegex = /^---\s*P[ÁA]GINA\s+(\d+)\s*\(PDF Original:\s*(\d+)\)\s*---$/i;
      const lines = initialContent.split("\n");
      const transformedLines = lines.map((line) => {
        const match = line.trim().match(pageMarkerRegex);
        if (match) {
          const sequentialNum = match[1]; // Numeración de la transcripción (1, 2, 3...)
          const pdfPageNum = match[2];    // Número de página del PDF original
          const totalPages = item.originalPageCount || '?';
          const bannerText =
            `Página ${sequentialNum} de ${item.pageCount} | ` +
            `[File Page ${pdfPageNum} de ${totalPages} REFERENCE — DO NOT CITE THIS NUMBER - ` +
            `for transcription reference only; not an official page number; ` +
            `do not use in citations, footnotes, bibliographies, or tables of contents]`;

          return `<div class="page-ref-banner text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-lg px-3 py-2 my-4">
  ${bannerText}
</div>`;
        }
        return line;
      });

      initialContent = transformedLines.join("\n").replace(/\n/g, "<br/>");
    }

    setHtmlContent(initialContent);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
    setTags(item.tags || []);
  }, [item.id, item.transcription, item.tags]);

  useEffect(() => {
    if (viewMode === "editor" && editorRef.current) {
      editorRef.current.innerHTML = htmlContent;
    }
  }, [viewMode]);

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setHtmlContent(newContent);
    setIsSaved(false);
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
    }
  };

  const handleSave = () => {
    onUpdateTranscription(item.id, htmlContent);
    setIsSaved(true);
    setIsEditing(false);
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const getCleanText = () => {
    if (!editorRef.current) {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = htmlContent;
      return tmp.innerText || "";
    }
    return editorRef.current.innerText;
  };

  const handleGenerateTags = async () => {
    setIsGeneratingTags(true);
    setSuggestedTags([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const text = getCleanText();
      const truncatedText = text.substring(0, 5000);
      const prompt = prompts.autoTagging.replace(
        "[TRANSCRIPTION]",
        truncatedText
      );

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      const result = JSON.parse(response.text);
      if (Array.isArray(result)) {
        const newSuggestions = result.filter((t) => !tags.includes(t));
        setSuggestedTags(newSuggestions);
        if (newSuggestions.length === 0) {
          alert(
            "La IA no encontró etiquetas nuevas relevantes que no tengas ya."
          );
        }
      }
    } catch (error) {
      console.error("Error generating tags", error);
      alert("No se pudieron generar etiquetas automáticamente.");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag || tags.includes(trimmedTag)) return;

    const newTags = [...tags, trimmedTag];
    setTags(newTags);
    onUpdateTags(item.id, newTags);

    setSuggestedTags((prev) => prev.filter((t) => t !== trimmedTag));
    setNewTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    onUpdateTags(item.id, newTags);
  };

  const handleManualTagKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(newTagInput);
    }
  };

  const downloadTxt = () => {
    const text = getCleanText();
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${item.name}-transcription.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadTranscriptionPdf = async () => {
    const rawText = getCleanText();
    
    if (!rawText.trim()) {
      alert("No hay contenido para exportar a PDF.");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      const margin = 48;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 16;

      // Dividir el texto en páginas usando el marcador --- PÁGINA X (PDF Original: Y) ---
      const pageMarkerRegex = /^---\s*P[ÁA]GINA\s+(\d+)\s*\(PDF Original:\s*(\d+)\)\s*---$/im;
      // Regex para detectar el disclaimer que viene en el contenido
      const disclaimerRegex = /^\[Transcription Page \d+ \| File Page \d+ REFERENCE.*?\]$/i;
      const sections: Array<{ sequentialNum: number; pdfPageNum: number; content: string }> = [];
      
      const lines = rawText.split("\n");
      let currentSequentialNum = 1;
      let currentPdfPageNum = 1;
      let currentContent: string[] = [];

      for (const line of lines) {
        const match = line.match(pageMarkerRegex);
        const isDisclaimer = line.trim().match(disclaimerRegex);
        
        if (match) {
          // Encontramos un marcador de página
          if (currentContent.length > 0) {
            sections.push({
              sequentialNum: currentSequentialNum,
              pdfPageNum: currentPdfPageNum,
              content: currentContent.join("\n").trim(),
            });
            currentContent = [];
          }
          currentSequentialNum = parseInt(match[1], 10);
          currentPdfPageNum = parseInt(match[2], 10);
        } else if (!isDisclaimer) {
          // Solo agregar la línea si NO es un disclaimer
          currentContent.push(line);
        }
        // Si es disclaimer, simplemente lo ignoramos (no lo agregamos al contenido)
      }

      // Agregar la última sección
      if (currentContent.length > 0) {
        sections.push({
          sequentialNum: currentSequentialNum,
          pdfPageNum: currentPdfPageNum,
          content: currentContent.join("\n").trim(),
        });
      }

      if (sections.length === 0) {
        alert("No se encontraron páginas en la transcripción.");
        return;
      }

      // Generar cada página en una hoja individual del PDF
      sections.forEach((section, index) => {
        if (index > 0) {
          doc.addPage();
        }

        let cursorY = margin;

        // --- ENCABEZADO DE PÁGINA ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0);
        const totalPages = item.originalPageCount || sections.length;
        const totalTranscribedPages = item.pageCount || sections.length;
        doc.text(`PÁGINA ${section.sequentialNum} de ${totalTranscribedPages}`, margin, cursorY);
        cursorY += 20;

        // Subtitle con número de página del PDF original
        doc.setFontSize(12);
        doc.setTextColor(80);
        doc.text(`(PDF Original: Página ${section.pdfPageNum} de ${totalPages})`, margin, cursorY);
        cursorY += 20;

        // Disclaimer de referencia
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        const disclaimer = `[Transcription Page ${section.sequentialNum} | File Page ${section.pdfPageNum} REFERENCE — DO NOT CITE THIS NUMBER - for transcription reference only; not an official page number; do not use in citations, footnotes, bibliographies, or tables of contents]`;
        const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
        disclaimerLines.forEach((line: string) => {
          doc.text(line, margin, cursorY);
          cursorY += 10;
        });
        cursorY += 10;

        // Línea separadora
        doc.setDrawColor(200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 20;

        // --- CONTENIDO DE LA PÁGINA ---
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);

        // Dividir contenido en párrafos
        const paragraphs = section.content
          .split(/\n\s*\n/g)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        paragraphs.forEach((paragraph) => {
          const wrappedLines = doc.splitTextToSize(paragraph, contentWidth);

          wrappedLines.forEach((line: string) => {
            // Si llegamos al final de la página, continuar en la siguiente
            if (cursorY > pageHeight - 100) {
              doc.addPage();
              cursorY = margin;
              
              // Mini-encabezado de continuación
              doc.setFontSize(10);
              doc.setTextColor(130);
              const totalTranscribedPages = item.pageCount || sections.length;
              doc.text(`PÁGINA ${section.sequentialNum} de ${totalTranscribedPages} (continuación) - PDF Original: Pág. ${section.pdfPageNum}`, margin, cursorY);
              cursorY += 20;
              doc.setFontSize(11);
              doc.setTextColor(0);
            }

            doc.text(line, margin, cursorY);
            cursorY += lineHeight;
          });

          // Espacio entre párrafos
          cursorY += lineHeight * 0.5;
        });

        // --- FOOTER ---
        const footerBaseText =
          "[logs · File Page Reference · DO NOT CITE THIS NUMBER - for transcription reference only; not an official page number; do not use in citations, footnotes, bibliographies, or tables of contents]";
        
        doc.setFontSize(7);
        doc.setTextColor(130);
        const footerLines = doc.splitTextToSize(footerBaseText, contentWidth);
        const footerLineHeight = 8;
        const totalFooterHeight = footerLines.length * footerLineHeight;
        let footerYStart = pageHeight - margin - totalFooterHeight;

        footerLines.forEach((line: string) => {
          doc.text(line, margin, footerYStart);
          footerYStart += footerLineHeight;
        });

        // Número de página (referencia de PDF, no del documento original)
        doc.setFontSize(8);
        const pageLabel = `Hoja ${index + 1} de ${sections.length}`;
        const labelWidth = doc.getTextWidth(pageLabel);
        doc.text(pageLabel, pageWidth - margin - labelWidth, pageHeight - 15);
      });

      doc.save(`${item.name}-transcription.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Ocurrió un error al generar el PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const downloadOriginalPdf = async () => {
    setIsDownloadingOriginal(true);
    try {
      const blob = await dbService.downloadOriginalPdf(item.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.fileName || "original.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert("No se pudo encontrar el archivo original en la nube.");
      }
    } catch (error) {
      console.error("Failed to download file", error);
      alert("Ocurrió un error al intentar descargar el archivo.");
    } finally {
      setIsDownloadingOriginal(false);
    }
  };

  const generateGeneralTable = async () => {
    setGeneratingTable(true);
    setGenerationError("");
    setGeneratedTable(null);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
      const text = getCleanText();
      
      // Usar el prompt de configuración y reemplazar la variable [TRANSCRIPTION]
      const indexPrompt = prompts.documentIndex.replace("[TRANSCRIPTION]", text);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: indexPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    documentName: { type: Type.STRING },
                    isAnnex: { type: Type.STRING },
                    internalPages: { type: Type.STRING },
                    pdfPages: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ["documentName", "isAnnex", "internalPages", "pdfPages", "notes"],
                },
              },
            },
            required: ["documents"],
          },
        },
      });

      const jsonResult = JSON.parse(response.text);

      if (jsonResult.documents && Array.isArray(jsonResult.documents)) {
        // Agregar numeración secuencial
        const documentsWithNumbers = jsonResult.documents.map((doc: Omit<TableRow, 'number'>, index: number) => ({
          number: index + 1,
          ...doc
        }));
        setGeneratedTable(documentsWithNumbers);
      } else {
        throw new Error("La respuesta de la API no tiene el formato esperado.");
      }
    } catch (err) {
      console.error("Error generating table:", err);
      setGenerationError("No se pudo generar el índice.");
    } finally {
      setGeneratingTable(false);
    }
  };

  const generatePageTable = async () => {
    setGeneratingPageTable(true);
    setPageTableError("");
    setGeneratedPageTable(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const text = getCleanText();
      const prompt = prompts.pageSummary.replace("[TRANSCRIPTION]", text);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    page_number: { type: Type.INTEGER },
                    summary: { type: Type.STRING },
                  },
                  required: ["page_number", "summary"],
                },
              },
            },
            required: ["pages"],
          },
        },
      });

      const jsonResult = JSON.parse(response.text);

      if (jsonResult.pages && Array.isArray(jsonResult.pages)) {
        setGeneratedPageTable(
          jsonResult.pages.sort(
            (a: any, b: any) => a.page_number - b.page_number
          )
        );
      } else {
        throw new Error("La respuesta de la API no tiene el formato esperado.");
      }
    } catch (err) {
      console.error("Error generating page table:", err);
      setPageTableError("No se pudo generar la tabla por páginas.");
    } finally {
      setGeneratingPageTable(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans text-slate-800 dark:text-slate-100">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors dark:hover:bg-slate-800 dark:text-slate-300"
            title="Volver"
          >
            <HiOutlineArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {item.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium border border-slate-200 uppercase tracking-wide dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
                {item.provider === "gemini" ? "Gemini AI" : "GPT-4o"}
              </span>
              • {item.fileName}
            </p>
          </div>
        </div>

        {/* Acciones Rápidas Header */}
        <div className="flex gap-2">
          {item.error && (
            <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-2 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
              <HiOutlineExclamationCircle className="w-5 h-5" />
              Fallido
            </span>
          )}
          {!item.error && (
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-100 flex items-center gap-2 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
              <HiOutlineCheckCircle className="w-5 h-5" />
              Completado
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Páginas Originales
            </span>
            <HiOutlineDocumentDuplicate className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {item.originalPageCount || "-"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Rango Transcrito
            </span>
            <HiOutlineDocumentText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {item.pages === "Todas" 
                ? `1-${item.originalPageCount || item.pageCount}` 
                : item.pages}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {item.pageCount} {item.pageCount === 1 ? 'página' : 'páginas'} de {item.originalPageCount || item.pageCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Fecha Proceso
            </span>
            <HiOutlineCalendar className="w-5 h-5" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {item.date}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between h-32 ${
            item.error
              ? "bg-red-50 border-red-100 dark:bg-red-950/40 dark:border-red-900"
              : "bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900"
          }`}
        >
          <div
            className={`flex items-center justify-between mb-2 ${
              item.error ? "text-red-400" : "text-blue-400"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider">
              Estado Actual
            </span>
            {item.error ? (
              <HiOutlineExclamationCircle className="w-5 h-5" />
            ) : (
              <HiOutlineCheckCircle className="w-5 h-5" />
            )}
          </div>
          <div
            className={`text-xl font-bold ${
              item.error
                ? "text-red-700 dark:text-red-300"
                : "text-blue-700 dark:text-blue-300"
            }`}
          >
            {item.error ? "Error" : "Finalizado"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm dark:bg-gray-900 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
              <HiOutlineTag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-50">
                Etiquetado Inteligente
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organiza tus documentos con palabras clave
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateTags}
            disabled={isGeneratingTags}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold cursor-pointer hover:bg-purple-100 transition-colors disabled:opacity-50 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
          >
            {isGeneratingTags ? (
              <>
                <span className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
                Generando...
              </>
            ) : (
              <>
                <HiSparkles className="w-4 h-4" />
                Sugerir con IA
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.length === 0 && (
            <span className="text-sm text-slate-400 dark:text-slate-500 italic py-1">
              No hay etiquetas asignadas.
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full border border-slate-200 group dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors dark:hover:bg-red-900/60"
              >
                <HiXMark className="w-3 h-3" />
              </button>
            </span>
          ))}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleManualTagKey}
              placeholder="+ Añadir..."
              className="w-32 px-3 py-1 text-sm bg-transparent border border-dashed border-slate-300 rounded-full focus:w-48 focus:border-blue-500 focus:ring-0 transition-all outline-none placeholder:text-slate-400 dark:border-slate-600 dark:placeholder-slate-500 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Sugerencias IA */}
        {suggestedTags.length > 0 && (
          <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100/50 dark:bg-purple-950/40 dark:border-purple-900/60">
            <p className="text-xs font-bold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-1">
              <HiSparkles className="w-3 h-3" />
              Sugerencias de la IA:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="text-xs bg-white text-purple-600 px-3 py-1 rounded-lg border border-purple-100 hover:border-purple-300 hover:shadow-sm transition-all flex items-center gap-1 dark:bg-gray-900 dark:text-purple-200 dark:border-purple-900 dark:hover:bg-purple-950/40"
                >
                  <HiPlus className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {item.error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-start gap-4 dark:bg-red-950/40 dark:border-red-900">
          <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0 dark:bg-red-900 dark:text-red-300">
            <HiOutlineExclamationCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-red-900 dark:text-red-300">
              Error durante la transcripción
            </h3>
            <p className="text-red-700 dark:text-red-200 mt-1 text-sm leading-relaxed">
              {item.error}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            Exportar Documentos
          </h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadOriginalPdf}
              disabled={!isOriginalAvailable || isDownloadingOriginal}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all text-sm font-semibold cursor-pointer disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              {isDownloadingOriginal ? (
                <span className="loader w-4 h-4" />
              ) : (
                <HiOutlineDocumentDuplicate className="w-4 h-4" />
              )}
              Original
            </button>
            <button
              onClick={downloadTxt}
              disabled={!htmlContent}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 cursor-pointer rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all text-sm font-semibold disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <HiOutlineDocumentText className="w-4 h-4" />
              Texto (TXT)
            </button>
            <button
              onClick={downloadTranscriptionPdf}
              disabled={!htmlContent || isGeneratingPdf}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 cursor-pointer rounded-xl border border-blue-200 hover:bg-blue-100 transition-all text-sm font-semibold disabled:opacity-50 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 dark:hover:bg-blue-900/60"
            >
              {isGeneratingPdf ? (
                <span className="loader w-4 h-4" />
              ) : (
                <HiOutlineCloudArrowDown className="w-4 h-4" />
              )}
              PDF Transcrito
            </button>
          </div>
        </div>

        {!item.error && (
          <div className="flex-1 bg-linear-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 shadow-sm dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 dark:border-slate-700">
            <h4 className="text-xs font-bold text-blue-400 dark:text-blue-300 uppercase tracking-wider mb-4 flex items-center gap-1">
              <HiSparkles className="w-3 h-3" />
              Análisis Avanzado
            </h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateGeneralTable}
                disabled={generatingTable || generatedTable !== null}
                className="flex-1 min-w-40 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-700 rounded-xl cursor-pointer border border-blue-200 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all text-sm font-bold disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none dark:bg-gray-900 dark:text-blue-300 dark:border-blue-900"
              >
                {generatingTable ? (
                  <span className="loader w-4 h-4 border-blue-600 border-t-transparent" />
                ) : (
                  <HiOutlineTableCells className="w-4 h-4" />
                )}
                Índice del Documento
              </button>
              <button
                onClick={generatePageTable}
                disabled={generatingPageTable || generatedPageTable !== null}
                className="flex-1 min-w-40 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-indigo-700 rounded-xl cursor-pointer border border-indigo-200 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all text-sm font-bold disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none dark:bg-gray-900 dark:text-indigo-300 dark:border-indigo-900"
              >
                {generatingPageTable ? (
                  <span className="loader w-4 h-4 border-indigo-600 border-t-transparent" />
                ) : (
                  <HiOutlineDocumentDuplicate className="w-4 h-4" />
                )}
                Tabla por Páginas
              </button>
            </div>
            {(generationError || pageTableError) && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium text-center">
                {generationError || pageTableError}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 flex justify-center">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-inner dark:bg-slate-800 dark:shadow-none">
          <button
            onClick={() => setViewMode("editor")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              viewMode === "editor"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <HiOutlinePencil className="w-4 h-4" />
            Editor de Texto
          </button>
          <button
            onClick={() => setViewMode("chat")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              viewMode === "chat"
                ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
            Chat con Documento
          </button>
        </div>
      </div>
      {(generatedTable || generatedPageTable) && (
        <div className="mt-12 space-y-8 animate-fadeIn">
          {generatedTable && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm dark:bg-gray-900 dark:border-gray-700">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2 dark:bg-gray-800 dark:border-gray-700">
                <HiOutlineTableCells className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-50">
                  Índice del Documento
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 dark:bg-gray-800 dark:border-gray-700 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-bold text-center whitespace-nowrap">N.°</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">Nombre literal del documento</th>
                      <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Anexo</th>
                      <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Páginas (paginación interna)</th>
                      <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Página del PDF</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                    {generatedTable.map((doc, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-center font-medium">
                          {doc.number}
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">
                          {doc.documentName}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            doc.isAnnex.toLowerCase() === 'sí' || doc.isAnnex.toLowerCase() === 'si'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : doc.isAnnex.toLowerCase() === 'no'
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {doc.isAnnex}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 text-center font-mono text-xs">
                          {doc.internalPages}
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 text-center font-mono text-xs font-semibold">
                          {doc.pdfPages}
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 text-sm">
                          {doc.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {generatedPageTable && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <HiOutlineDocumentDuplicate className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">
                  Desglose por Páginas
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-bold w-24 text-center">
                        Pág.
                      </th>
                      <th className="px-6 py-3 font-bold">
                        Contenido Relevante
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {generatedPageTable.map((part, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-indigo-600 text-center text-lg">
                          {part.page_number}
                        </td>
                        <td className="px-6 py-4 text-slate-600 leading-relaxed">
                          {part.summary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[600px] dark:bg-gray-950 dark:border-gray-800 dark:shadow-slate-900/40">
        {viewMode === "editor" && (
          <div className="flex flex-col h-full">
            <div className="border-b border-slate-100 p-3 flex items-center gap-2 bg-slate-50/50 flex-wrap dark:border-slate-800 dark:bg-slate-900/60">
              {isEditing ? (
                <>
                  <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                    <button
                      className="p-2 hover:bg-slate-50 rounded text-slate-700 font-bold cursor-pointer dark:text-slate-100 dark:hover:bg-slate-800"
                      onClick={() => execCmd("bold")}
                    >
                      B
                    </button>
                    <button
                      className="p-2 hover:bg-slate-50 rounded text-slate-700 italic cursor-pointer dark:text-slate-100 dark:hover:bg-slate-800"
                      onClick={() => execCmd("italic")}
                    >
                      I
                    </button>
                    <button
                      className="p-2 hover:bg-slate-50 rounded text-slate-700 underline cursor-pointer dark:text-slate-100 dark:hover:bg-slate-800"
                      onClick={() => execCmd("underline")}
                    >
                      U
                    </button>
                  </div>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-3">
                  Modo Lectura
                </span>
              )}

              <div className="ml-auto flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={toggleEditMode}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                  >
                    <HiOutlinePencil className="w-3.5 h-3.5" />
                    Editar Contenido
                  </button>
                ) : (
                  <>
                    <button
                      onClick={toggleEditMode}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer dark:text-red-300 dark:hover:bg-red-900/60"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaved}
                      className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer ${
                        isSaved
                          ? "bg-green-500 dark:bg-green-600"
                          : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      }`}
                    >
                      {isSaved ? "Guardado" : "Guardar Cambios"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div
              className={`p-8 md:p-12 outline-none min-h-[500px] prose prose-slate max-w-none ${
                !isEditing
                  ? "bg-slate-50/30 dark:bg-slate-900/40"
                  : "bg-white dark:bg-slate-950"
              }`}
              contentEditable={isEditing && !item.error}
              ref={editorRef}
              onInput={handleEditorInput}
              suppressContentEditableWarning={true}
              spellCheck={isEditing}
            />
          </div>
        )}

        {/* CHAT VIEW */}
        {viewMode === "chat" && (
          <DocumentChat
            transcriptionText={getCleanText()}
            transcriptionId={item.id}
          />
        )}
      </div>
    </div>
  );
}
