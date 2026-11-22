import { supabase } from '../lib/supabase';
import { removerFoto, urlsAssinadas } from './fotosService';

// Produto + todos os preços + nome do mercado de cada preço, numa só consulta.
const SELECT_PRODUTO =
  '*, precos(id, produto_id, mercado_id, preco_yen, com_imposto, observado_em, mercados(nome))';

async function anexarFotos(produtos) {
  const caminhos = produtos.map((p) => p.foto_path).filter(Boolean);
  const urls = await urlsAssinadas(caminhos);
  return produtos.map((p) => ({ ...p, fotoUrl: urls[p.foto_path] ?? null }));
}

export async function listarProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select(SELECT_PRODUTO)
    .order('nome', { ascending: true })
    .order('observado_em', { referencedTable: 'precos', ascending: true });
  if (error) throw error;
  return anexarFotos(data);
}

export async function buscarProduto(id) {
  const { data, error } = await supabase
    .from('produtos')
    .select(SELECT_PRODUTO)
    .eq('id', id)
    .order('observado_em', { referencedTable: 'precos', ascending: true })
    .single();
  if (error) throw error;
  const [produto] = await anexarFotos([data]);
  return produto;
}

export async function criarProduto({ nome, descricao, foto_path }) {
  const { data, error } = await supabase
    .from('produtos')
    .insert({ nome: nome.trim(), descricao: descricao?.trim() || null, foto_path: foto_path ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function excluirProduto(produto) {
  const { error } = await supabase.from('produtos').delete().eq('id', produto.id);
  if (error) throw error;
  await removerFoto(produto.foto_path).catch(() => {}); // foto órfã não deve travar a exclusão
}
