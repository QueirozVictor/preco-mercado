import { supabase } from '../lib/supabase';

export async function criarPreco({ produto_id, mercado_id, preco_yen, com_imposto, observado_em }) {
  const { data, error } = await supabase
    .from('precos')
    .insert({ produto_id, mercado_id, preco_yen, com_imposto, observado_em })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removerPreco(id) {
  const { error } = await supabase.from('precos').delete().eq('id', id);
  if (error) throw error;
}
