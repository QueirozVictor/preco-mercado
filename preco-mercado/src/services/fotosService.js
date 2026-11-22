import { supabase, BUCKET_FOTOS } from '../lib/supabase';
import { extensaoDoBlob } from '../utils/converterImagem';

// Salva em <id-do-usuario>/<uuid>.webp (as policies do Storage exigem essa pasta).
export async function enviarFoto(blob, usuarioId) {
  const caminho = `${usuarioId}/${crypto.randomUUID()}.${extensaoDoBlob(blob)}`;
  const { error } = await supabase.storage.from(BUCKET_FOTOS).upload(caminho, blob, {
    contentType: blob.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return caminho;
}

// Bucket privado: gera links temporários para exibir as fotos. Retorna { [caminho]: url }.
export async function urlsAssinadas(caminhos, segundos = 3600) {
  if (caminhos.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .createSignedUrls(caminhos, segundos);
  if (error) throw error;
  return Object.fromEntries(
    data.filter((item) => item.signedUrl).map((item) => [item.path, item.signedUrl]),
  );
}

export async function removerFoto(caminho) {
  if (!caminho) return;
  const { error } = await supabase.storage.from(BUCKET_FOTOS).remove([caminho]);
  if (error) throw error;
}
