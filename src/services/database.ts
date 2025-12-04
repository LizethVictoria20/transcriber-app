
import { supabase } from './supabaseClient';
import type { TranscriptionItem, ChatMessage } from '../types';

type TranscriptionRow = {
    id: number;
    name: string;
    file_name: string;
    pages: string;
    page_count: number;
    original_page_count?: number;
    provider: 'gemini' | 'openai';
    transcription: string;
    created_at: string;
    error?: string;
    tags?: string[];
};

type DocumentChatRow = {
    id: number;
    user_id: string;
    transcription_id: number;
    messages: ChatMessage[];
    updated_at: string;
};

// Table name in Supabase
const TABLE_NAME = 'transcriptions';
// Bucket name in Supabase Storage
const BUCKET_NAME = 'pdfs';

export const dbService = {
    // --- DATABASE OPERATIONS ---

    getAllTranscriptions: async (userId: string | null): Promise<TranscriptionItem[]> => {
        console.log('🔵 getAllTranscriptions - Usuario (propagado):', userId);

        if (!userId) {
            return [];
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        console.log('🔵 getAllTranscriptions - Registros encontrados:', data?.length);

        if (error) {
            console.error('Error fetching transcriptions:', error);
            // Return empty array instead of throwing to allow UI to render
            return [];
        }

        // Map DB columns (snake_case) to App types (camelCase)
        return (data || []).map((item: TranscriptionRow) => ({
            id: item.id,
            name: item.name,
            fileName: item.file_name,
            pages: item.pages,
            pageCount: item.page_count,
            originalPageCount: item.original_page_count,
            provider: item.provider,
            transcription: item.transcription,
            date: new Date(item.created_at).toLocaleString(),
            error: item.error,
            tags: item.tags || []
        }));
    },

    createTranscription: async (item: Omit<TranscriptionItem, 'id' | 'date'>, file: File): Promise<TranscriptionItem> => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error('Usuario no autenticado');

        // 1. Insert record into DB
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([{
                user_id: user.id,
                name: item.name,
                file_name: item.fileName,
                pages: item.pages,
                page_count: item.pageCount,
                original_page_count: item.originalPageCount,
                provider: item.provider,
                transcription: item.transcription,
                error: item.error,
                tags: item.tags
            }])
            .select()
            .single();

        if (error) throw error;

        const inserted = data as TranscriptionRow;
        const newItemId = inserted.id;

        // 2. Upload File to Storage
        // Path format: user_id/transcription_id.pdf
        const filePath = `${user.id}/${newItemId}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            // Optional: delete the DB record if file upload fails?
        }

        // Normalize using the same mapping as getAllTranscriptions
        return {
            id: inserted.id,
            name: inserted.name,
            fileName: inserted.file_name,
            pages: inserted.pages,
            pageCount: inserted.page_count,
            originalPageCount: inserted.original_page_count,
            provider: inserted.provider,
            transcription: inserted.transcription,
            date: new Date(inserted.created_at).toLocaleString(),
            error: inserted.error,
            tags: inserted.tags || []
        };
    },

    deleteTranscription: async (id: number): Promise<void> => {
        console.log('🔵 dbService.deleteTranscription llamado con ID:', id);
        
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error('🔵 Error obteniendo usuario:', userError);
            throw new Error('Usuario no autenticado');
        }

        const user = userData.user;
        console.log('🔵 Usuario autenticado:', user.id);

        const filePath = `${user.id}/${id}.pdf`;
        console.log('🔵 Intentando eliminar archivo:', filePath);
        
        const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (storageError) {
            console.warn('⚠️ Error deleting file from storage:', storageError);
            // Continue anyway; DB record deletion is the critical part for the app
        } else {
            console.log('🔵 Archivo eliminado del storage');
        }

        console.log('🔵 Intentando eliminar registro de la tabla:', TABLE_NAME);
        console.log('🔵 Filtros: id =', id, ', user_id =', user.id);
        
        const { data: deletedData, error: dbError } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
            .select();

        console.log('🔵 Resultado del DELETE:', deletedData);
        
        if (dbError) {
            console.error('❌ Error eliminando de la BD:', dbError);
            throw dbError;
        }
        
        if (!deletedData || deletedData.length === 0) {
            console.warn('⚠️ DELETE ejecutado pero no eliminó ningún registro. Posible problema de RLS o el registro no pertenece a este usuario');
            throw new Error('No se pudo eliminar el registro. Verifica que te pertenezca.');
        }
        
        console.log('✅ Registro eliminado de la BD exitosamente. Eliminados:', deletedData.length);
    },

    updateTranscriptionText: async (id: number, text: string): Promise<void> => {
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ transcription: text })
            .eq('id', id);
        
        if (error) throw error;
    },

    updateTranscriptionTags: async (id: number, tags: string[]): Promise<void> => {
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ tags: tags })
            .eq('id', id);
        
        if (error) throw error;
    },

    // --- STORAGE OPERATIONS ---

    downloadOriginalPdf: async (transcriptionId: number): Promise<Blob | null> => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return null;

        const filePath = `${user.id}/${transcriptionId}.pdf`;
        
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(filePath);

        if (error) {
            console.error('Error downloading file:', error);
            throw error;
        }

        return data;
    },

    checkPdfExists: async (): Promise<boolean> => {
         // This is a simplified check. In a real app, we might query the bucket list 
         // or just rely on the download failing gracefully.
         // For now, we assume if the record exists in DB, the file *should* exist.
         return true; 
    },

    // --- DOCUMENT CHAT OPERATIONS ---

    getDocumentChat: async (transcriptionId: number): Promise<ChatMessage[]> => {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
            console.warn("getDocumentChat called without authenticated user");
            return [];
        }

        const { data, error } = await supabase
            .from<DocumentChatRow>('document_chats')
            .select('messages')
            .eq('user_id', userId)
            .eq('transcription_id', transcriptionId)
            .maybeSingle();

        if (error) {
            console.error("Error fetching document chat:", error);
            return [];
        }

        return data?.messages || [];
    },

    saveDocumentChat: async (transcriptionId: number, messages: ChatMessage[]): Promise<void> => {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
            console.warn("saveDocumentChat called without authenticated user");
            return;
        }

        console.log("🔵 saveDocumentChat -> user:", userId, "transcription:", transcriptionId, "messages:", messages.length);

        const { error } = await supabase
            .from('document_chats')
            .upsert(
                {
                    user_id: userId,
                    transcription_id: transcriptionId,
                    messages,
                },
                { onConflict: 'user_id,transcription_id' }
            );

        if (error) {
            console.error("Error saving document chat:", error);
            throw error;
        }
    }
};
