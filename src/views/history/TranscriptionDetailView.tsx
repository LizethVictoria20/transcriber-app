import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { dbService } from "../../services/database";
import DocumentChat from "../../components/chat/DocumentChat";
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
  topic: string;
  summary: string;
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
      initialContent = initialContent.replace(/\n/g, "<br/>");
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
    if (!editorRef.current && viewMode !== "editor") {
      alert(
        "Por favor, cambia a la pestaña 'Editor de Texto' para generar el PDF con formato."
      );
      setViewMode("editor");
      return;
    }

    if (!editorRef.current) return;

    setIsGeneratingPdf(true);

    try {
      if (!(window as any).html2canvas) {
        (window as any).html2canvas = html2canvas;
      }

      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      const element = editorRef.current;
      const margin = 40;
      const pdfWidth = 595.28;
      const availableWidth = pdfWidth - margin * 2;
      const scale = availableWidth / element.offsetWidth;

      await doc.html(element, {
        callback: function (doc) {
          doc.save(`${item.name}-transcription.pdf`);
          setIsGeneratingPdf(false);
        },
        x: margin,
        y: margin,
        html2canvas: {
          scale: scale,
          useCORS: true,
          logging: false,
        },
        width: availableWidth,
        windowWidth: element.offsetWidth,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Ocurrió un error al generar el PDF.");
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const text = getCleanText();
      const prompt = prompts.summary.replace("[TRANSCRIPTION]", text);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              important_parts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    summary: { type: Type.STRING },
                  },
                  required: ["topic", "summary"],
                },
              },
            },
            required: ["important_parts"],
          },
        },
      });

      const jsonResult = JSON.parse(response.text);

      if (
        jsonResult.important_parts &&
        Array.isArray(jsonResult.important_parts)
      ) {
        setGeneratedTable(jsonResult.important_parts);
      } else {
        throw new Error("La respuesta de la API no tiene el formato esperado.");
      }
    } catch (err) {
      console.error("Error generating table:", err);
      setGenerationError("No se pudo generar la tabla.");
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
    <div className="transcription-detail">
      <div className="settings-page-header">
        <button className="button secondary" onClick={onBack}>
          &larr; Volver al listado
        </button>
        <h2>{item.name}</h2>
      </div>

      <div
        className="metrics-grid"
        style={{ marginTop: "1rem", marginBottom: "1.5rem" }}
      >
        <div className="metric-card" style={{ padding: "1rem" }}>
          <div className="metric-label">Páginas Originales</div>
          <div className="metric-value">
            {item.originalPageCount || "Desc."}
          </div>
        </div>
        <div className="metric-card" style={{ padding: "1rem" }}>
          <div className="metric-label">Páginas Transcritas</div>
          <div className="metric-value">{item.pageCount}</div>
        </div>
        <div className="metric-card" style={{ padding: "1rem" }}>
          <div className="metric-label">Fecha</div>
          <div className="metric-value" style={{ fontSize: "1.1rem" }}>
            {item.date}
          </div>
        </div>
        <div className="metric-card" style={{ padding: "1rem" }}>
          <div className="metric-label">Estado</div>
          <div className="metric-value" style={{ fontSize: "1.1rem" }}>
            {item.error ? (
              <span style={{ color: "var(--danger-color)" }}>Fallido</span>
            ) : (
              <span style={{ color: "var(--secondary-color)" }}>
                Completado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tagging Section */}
      <div
        className="settings-category"
        style={{
          border: "1px solid var(--border-color)",
          padding: "1rem",
          borderRadius: "var(--border-radius)",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h4 style={{ margin: 0 }}>Etiquetado Inteligente</h4>
          <button
            className="button secondary small"
            onClick={handleGenerateTags}
            disabled={isGeneratingTags}
          >
            {isGeneratingTags ? (
              <span
                className="loader"
                style={{ width: "1em", height: "1em" }}
              ></span>
            ) : (
              "✨ Sugerir Etiquetas con IA"
            )}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          {tags.length === 0 && (
            <span
              style={{ color: "var(--muted-text-color)", fontSize: "0.9rem" }}
            >
              Sin etiquetas. Añade algunas para organizar tus documentos.
            </span>
          )}
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button
                className="tag-remove"
                onClick={() => removeTag(tag)}
                title="Eliminar etiqueta"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {suggestedTags.length > 0 && (
          <div className="tag-suggestions" style={{ marginBottom: "1rem" }}>
            <small>Sugerencias (clic para agregar):</small>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginTop: "0.25rem",
              }}
            >
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  className="tag-suggestion"
                  onClick={() => addTag(tag)}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="custom-input"
            style={{ padding: "0.4rem 0.8rem", width: "200px" }}
            placeholder="Añadir etiqueta..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleManualTagKey}
          />
          <button
            className="button secondary small"
            onClick={() => addTag(newTagInput)}
          >
            Añadir
          </button>
        </div>
      </div>

      {item.error && (
        <div className="error-message" style={{ marginBottom: "1.5rem" }}>
          <strong>Error durante la transcripción:</strong>
          <p>{item.error}</p>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid var(--border-color)",
          flexWrap: "wrap",
        }}
      >
        <button
          className="button secondary"
          onClick={downloadOriginalPdf}
          disabled={!isOriginalAvailable || isDownloadingOriginal}
        >
          {isDownloadingOriginal ? "Descargando..." : `📥 PDF Original`}
        </button>
        <button
          className="button secondary"
          onClick={downloadTxt}
          disabled={!htmlContent}
        >
          📄 Descargar TXT
        </button>
        <button
          className="button secondary"
          onClick={downloadTranscriptionPdf}
          disabled={!htmlContent || isGeneratingPdf}
        >
          {isGeneratingPdf ? "Generando..." : "📑 Descargar PDF"}
        </button>
      </div>

      {!item.error && (
        <div
          className="table-generation-controls"
          style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
        >
          <div>
            {!generatedTable && !generatingTable && (
              <button
                className="button secondary"
                onClick={generateGeneralTable}
              >
                ✨ Generar Resumen General
              </button>
            )}
            {generatingTable && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minHeight: "38px",
                }}
              >
                <span className="loader"></span>
                <span>Analizando documento...</span>
              </div>
            )}
          </div>

          <div>
            {!generatedPageTable && !generatingPageTable && (
              <button className="button secondary" onClick={generatePageTable}>
                📑 Generar Tabla por Páginas
              </button>
            )}
            {generatingPageTable && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minHeight: "38px",
                }}
              >
                <span className="loader"></span>
                <span>Analizando páginas...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {generationError && <p className="error-message">{generationError}</p>}
      {pageTableError && <p className="error-message">{pageTableError}</p>}

      <div className="tabs-header">
        <button
          className={`tab-button ${viewMode === "editor" ? "active" : ""}`}
          onClick={() => setViewMode("editor")}
        >
          ✏️ Editor de Texto
        </button>
        <button
          className={`tab-button ${viewMode === "chat" ? "active" : ""}`}
          onClick={() => setViewMode("chat")}
        >
          💬 Chat con IA
        </button>
      </div>

      {viewMode === "editor" && (
        <div className="editor-container">
          <div className="editor-toolbar">
            {isEditing ? (
              <>
                <button className="editor-btn" onClick={() => execCmd("bold")}>
                  <b>B</b>
                </button>
                <button
                  className="editor-btn"
                  onClick={() => execCmd("italic")}
                >
                  <i>I</i>
                </button>
                <button
                  className="editor-btn"
                  onClick={() => execCmd("underline")}
                >
                  <u>U</u>
                </button>
                <div
                  style={{
                    width: "1px",
                    background: "var(--border-color)",
                    margin: "0 4px",
                  }}
                ></div>
                <button
                  className="editor-btn"
                  onClick={() => execCmd("insertUnorderedList")}
                >
                  • List
                </button>
                <button
                  className="editor-btn"
                  onClick={() => execCmd("insertOrderedList")}
                >
                  1. List
                </button>
                <div
                  style={{
                    width: "1px",
                    background: "var(--border-color)",
                    margin: "0 4px",
                  }}
                ></div>
                <button
                  className="editor-btn"
                  onClick={() => execCmd("formatBlock", "H2")}
                >
                  H2
                </button>
                <button
                  className="editor-btn"
                  onClick={() => execCmd("formatBlock", "H3")}
                >
                  H3
                </button>
                <button
                  className="editor-btn"
                  onClick={() => execCmd("formatBlock", "P")}
                >
                  P
                </button>
              </>
            ) : (
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "var(--muted-text-color)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Modo de Lectura
              </span>
            )}

            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
              {!isEditing && (
                <button
                  className="button small secondary"
                  onClick={toggleEditMode}
                >
                  ✏️ Habilitar Edición
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    className="button small danger"
                    onClick={toggleEditMode}
                  >
                    Cancelar
                  </button>
                  <button
                    className={`button small ${isSaved ? "secondary" : ""}`}
                    onClick={handleSave}
                    disabled={isSaved}
                  >
                    {isSaved ? "Guardado" : "Guardar Cambios"}
                  </button>
                </>
              )}
            </div>
          </div>
          <div
            className={`editor-content ${!isEditing ? "read-only" : ""}`}
            contentEditable={isEditing && !item.error}
            ref={editorRef}
            onInput={handleEditorInput}
            suppressContentEditableWarning={true}
            spellCheck={isEditing}
          />
        </div>
      )}

      {viewMode === "chat" && (
        <DocumentChat
          transcriptionText={getCleanText()}
          provider={item.provider}
          apiKeys={apiKeys}
        />
      )}

      {generatedTable && (
        <div
          className="generated-table-container"
          style={{ marginTop: "2rem" }}
        >
          <h3>Resumen General Inteligente</h3>
          <table className="general-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Tema</th>
                <th>Resumen</th>
              </tr>
            </thead>
            <tbody>
              {generatedTable.map((part, index) => (
                <tr key={index}>
                  <td>{part.topic}</td>
                  <td>{part.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {generatedPageTable && (
        <div
          className="generated-table-container"
          style={{ marginTop: "2rem" }}
        >
          <h3>Resumen por Páginas</h3>
          <table className="general-table">
            <thead>
              <tr>
                <th style={{ width: "15%" }}>Página</th>
                <th>Resumen de Contenido</th>
              </tr>
            </thead>
            <tbody>
              {generatedPageTable.map((part, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>
                    {part.page_number}
                  </td>
                  <td>{part.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
