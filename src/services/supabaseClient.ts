
import { createClient } from '@supabase/supabase-js';

// Helper to safely access env variables in both Node/Webpack (process.env) and Vite (import.meta.env)
const getEnv = (key: string) => {
    let value = undefined;

    // 1. Try Vite / Modern Standard
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // Check for VITE_ prefix (standard for Vite) or direct key
            // @ts-ignore
            value = import.meta.env[key] || import.meta.env[`VITE_${key}`] || import.meta.env[`REACT_APP_${key}`];
        }
    } catch (e) {}

    if (value) return value;

    // 2. Try Node / Webpack / Create React App
    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env) {
            // @ts-ignore
            value = process.env[key] || process.env[`REACT_APP_${key}`];
        }
    } catch (e) {}

    return value;
};

// Replace with your project URL and Key or use environment variables
// Fallbacks are provided to prevent crashes if env vars are missing during initial load
const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseKey = getEnv('SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY') || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);
