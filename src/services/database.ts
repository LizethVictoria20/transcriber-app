
import { supabase } from './supabaseClient';
import type { TranscriptionItem } from '../types';

// Table name in Supabase
const TABLE_NAME = 'transcriptions';
// Bucket name in Supabase Storage
const BUCKET_NAME = 'pdfs';

export const dbService = {
    // --- DATABASE OPERATIONS ---

    getAllTranscriptions: async (): Promise<TranscriptionItem[]> => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching transcriptions:', error);
            // Return empty array instead of throwing to allow UI to render
            return [];
        }

        // Map DB columns (snake_case) to App types (camelCase)
        return data.map((item: any) => ({
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

        const newItemId = data.id;

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

        return {
            ...item,
            id: newItemId,
            date: new Date(data.created_at).toLocaleString(),
            tags: data.tags || []
        };
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

    checkPdfExists: async (transcriptionId: number): Promise<boolean> => {
         // This is a simplified check. In a real app, we might query the bucket list 
         // or just rely on the download failing gracefully.
         // For now, we assume if the record exists in DB, the file *should* exist.
         return true; 
    }
};
