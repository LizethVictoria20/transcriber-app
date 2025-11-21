import React, { useState, useMemo } from 'react';

export interface TranscriptionItem {
    id: number;
    name: string;
    fileName: string;
    pages: string;
    pageCount: number;
    originalPageCount?: number;
    provider: 'gemini' | 'openai';
    transcription: string;
    date: string;
    error?: string;
    tags?: string[];
}

interface HistoryViewProps {
    transcriptions: TranscriptionItem[];
    clearHistory: () => void;
    onSelectTranscription: (item: TranscriptionItem) => void;
}

type SortOrder = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
type StatusFilter = 'all' | 'completed' | 'error' | 'processing';

export default function HistoryView({ transcriptions, clearHistory, onSelectTranscription }: HistoryViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');

    // Filter and Sort Logic
    const processedItems = useMemo(() => {
        let items = [...transcriptions];

        // 1. Search Filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            items = items.filter(item => 
                item.name.toLowerCase().includes(term) || 
                item.fileName.toLowerCase().includes(term) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
            );
        }

        // 2. Status Filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'error') {
                items = items.filter(item => item.error);
            } else if (statusFilter === 'completed') {
                items = items.filter(item => !item.error);
            } else if (statusFilter === 'processing') {
                // Currently, items are only added to history when done, 
                // so this will return empty, but satisfies the UI requirement.
                items = []; 
            }
        }

        // 3. Sorting
        items.sort((a, b) => {
            switch (sortOrder) {
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'date-desc':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        return items;
    }, [transcriptions, searchTerm, statusFilter, sortOrder]);

    // Pagination Logic
    const totalPages = Math.ceil(processedItems.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedItems.slice(startIndex, startIndex + itemsPerPage);
    }, [processedItems, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
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
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h2>Historial de Transcripciones</h2>
                <button className="button danger" onClick={clearHistory}>Limpiar Historial</button>
            </div>

            <div className="history-toolbar">
                <div className="history-search-wrapper">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, archivo o etiqueta..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="history-search-input"
                    />
                </div>
                
                <div className="history-filters">
                    <div className="filter-group">
                        <label>Estado:</label>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                            className="history-select"
                        >
                            <option value="all">Todos</option>
                            <option value="completed">Completado</option>
                            <option value="error">Con Errores</option>
                            <option value="processing">Procesando</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Ordenar:</label>
                        <select 
                            value={sortOrder} 
                            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                            className="history-select"
                        >
                            <option value="date-desc">Más Reciente</option>
                            <option value="date-asc">Más Antiguo</option>
                            <option value="name-asc">A - Z</option>
                            <option value="name-desc">Z - A</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Mostrar:</label>
                        <select 
                            value={itemsPerPage} 
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="history-select"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {paginatedItems.length === 0 ? (
                <div className="no-results">
                    <p>No se encontraron resultados con los filtros actuales.</p>
                </div>
            ) : (
                <ul className="history-list">
                    {paginatedItems.map(item => (
                        <li key={item.id} className="history-item">
                            <div className="history-item-header" onClick={() => onSelectTranscription(item)}>
                                <div style={{width: '100%'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                        <strong>{item.name}</strong>
                                        <span style={{fontSize: '0.85rem', color: '#64748b'}}>{item.date}</span>
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem'}}>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                                            <small>Archivo: {item.fileName}</small>
                                            {item.tags && item.tags.length > 0 && (
                                                <div style={{display: 'flex', gap: '0.25rem', marginTop: '0.25rem'}}>
                                                    {item.tags.map(tag => (
                                                        <span key={tag} className="tag small" style={{fontSize: '0.7rem', padding: '0.1rem 0.4rem'}}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {item.error ? (
                                            <span style={{color: 'var(--danger-color)', fontSize: '0.8rem', fontWeight: 'bold'}}>⚠ Error en transcripción</span>
                                        ) : (
                                            <small>Páginas Transcritas: {item.pageCount}</small>
                                        )}
                                    </div>
                                </div>
                                <span style={{marginLeft: '1rem', color: 'var(--primary-color)'}}>➔</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button 
                        className="button secondary small" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                    <span className="pagination-info">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button 
                        className="button secondary small" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}