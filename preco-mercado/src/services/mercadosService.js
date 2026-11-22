import { supabase } from '../lib/supabase';

export async function listarMercados() {
  const { data, error } = await supabase
    .from('mercados')
    .select('id, nome, cidade')
    .order('nome', { ascending: true });
  if (error) throw error;
  return data;
}

export async function criarMercado({ nome, cidade }) {
  const { data, error } = await supabase
    .from('mercados')
    .insert({ nome: nome.trim(), cidade: cidade?.trim() || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}
