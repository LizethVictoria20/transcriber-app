
import { supabase } from './supabaseClient';
import { User } from '../types';

export const authService = {
    signIn: async (email: string, password: string): Promise<User> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (!data.user) throw new Error("No se pudo obtener el usuario");

        return {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            avatarUrl: data.user.user_metadata?.avatar_url
        };
    },

    signUp: async (email: string, password: string): Promise<User> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: email.split('@')[0],
                }
            }
        });

        if (error) throw error;
        if (!data.user) throw new Error("No se pudo crear el usuario");

        return {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name,
        };
    },

    signOut: async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        return {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url
        };
    }
};
