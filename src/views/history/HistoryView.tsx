import React, { useState, useMemo } from "react";
import type { TranscriptionItem } from "../../types";
import {
  HiOutlineTrash,
  HiMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineDocumentText,
  HiChevronRight,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi2";

interface HistoryViewProps {
  transcriptions: TranscriptionItem[];
  clearHistory: () => void;
  onSelectTranscription: (item: TranscriptionItem) => void;
}

type SortOrder = "date-desc" | "date-asc" | "name-asc" | "name-desc";
type StatusFilter = "all" | "completed" | "error" | "processing";

export default function HistoryView({
  transcriptions,
  clearHistory,
  onSelectTranscription,
}: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc");

  const processedItems = useMemo(() => {
    let items = [...transcriptions];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.fileName.toLowerCase().includes(term) ||
          (item.tags &&
            item.tags.some((tag) => tag.toLowerCase().includes(term)))
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "error") {
        items = items.filter((item) => item.error);
      } else if (statusFilter === "completed") {
        items = items.filter((item) => !item.error);
      } else if (statusFilter === "processing") {
        items = [];
      }
    }

    items.sort((a, b) => {
      switch (sortOrder) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return items;
  }, [transcriptions, searchTerm, statusFilter, sortOrder]);

  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [processedItems, currentPage, itemsPerPage]);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  if (transcriptions.length === 0) {
    return (
      <div>
        <h2>Historial de Transcripciones</h2>
        <p>Aún no has realizado ninguna transcripción.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-slate-800">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Historial de Transcripciones
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona y revisa tus documentos procesados.
          </p>
        </div>
        <button
          onClick={clearHistory}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
        >
          <HiOutlineTrash className="w-4 h-4" />
          Limpiar Historial
        </button>
      </div>

      {/* --- Filtros y Búsqueda --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Buscador */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, archivo o etiqueta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            {/* Filtro Estado */}
            <div className="relative min-w-[140px] flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineFunnel className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="completed">Completado</option>
                <option value="error">Con Errores</option>
                <option value="processing">Procesando</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>

            {/* Filtro Orden */}
            <div className="relative min-w-[140px] flex-1 sm:flex-none">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="block w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="date-desc">Más Reciente</option>
                <option value="date-asc">Más Antiguo</option>
                <option value="name-asc">A - Z</option>
                <option value="name-desc">Z - A</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>

            {/* Items por página */}
            <div className="relative w-20 flex-none">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="block w-full px-3 py-2.5 text-center text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- LISTA DE RESULTADOS --- */}
      {paginatedItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <HiMagnifyingGlass className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            No se encontraron resultados
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Intenta ajustar tus filtros o términos de búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectTranscription(item)}
              className="group bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  item.error
                    ? "bg-red-50 text-red-500"
                    : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                }`}
              >
                <HiOutlineDocumentText className="w-6 h-6" />
              </div>

              {/* Contenido Principal */}
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <div>
                  <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    {item.date}
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <p
                    className="text-sm text-slate-600 truncate"
                    title={item.fileName}
                  >
                    <span className="font-medium text-slate-400 text-xs uppercase mr-2">
                      Archivo:
                    </span>
                    {item.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {item.tags && item.tags.length > 0 ? (
                      item.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        Sin etiquetas
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-start md:justify-end gap-3">
                  {item.error ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                      <HiOutlineExclamationCircle className="w-4 h-4" />
                      Error
                    </span>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        Completado
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 mr-1">
                        {item.pageCount}{" "}
                        {item.pageCount === 1 ? "página" : "páginas"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors pl-2">
                <HiChevronRight className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PAGINACIÓN --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8">
          <button
            className="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="text-sm text-slate-600 font-medium">
            Página <span className="text-slate-900">{currentPage}</span> de{" "}
            <span className="text-slate-900">{totalPages}</span>
          </span>
          <button
            className="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
