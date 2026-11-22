import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const BUCKET_FOTOS = import.meta.env.VITE_SUPABASE_BUCKET || 'fotos';
export const supabaseConfigurado = Boolean(url && chave);

// Único arquivo que conhece a configuração do Supabase.
export const supabase = supabaseConfigurado ? createClient(url, chave) : null;
