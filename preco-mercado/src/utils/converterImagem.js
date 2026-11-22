function canvasParaBlob(canvas, tipo, qualidade) {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, qualidade));
}

/**
 * Reduz e converte a foto ANTES de enviar ao Supabase.
 * Foto de celular (3-5 MB) vira ~100-200 KB em WebP.
 */
export async function converterImagem(
  arquivo,
  { formato = 'image/webp', qualidade = 0.8, ladoMax = 1024 } = {},
) {
  const imagem = await createImageBitmap(arquivo);
  const escala = Math.min(1, ladoMax / Math.max(imagem.width, imagem.height));
  const largura = Math.round(imagem.width * escala);
  const altura = Math.round(imagem.height * escala);

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  canvas.getContext('2d').drawImage(imagem, 0, 0, largura, altura);
  imagem.close?.();

  let blob = await canvasParaBlob(canvas, formato, qualidade);
  // Navegadores sem suporte a WebP devolvem PNG: nesse caso usamos JPEG.
  if (!blob || blob.type !== formato) {
    blob = await canvasParaBlob(canvas, 'image/jpeg', qualidade);
  }
  if (!blob) throw new Error('Não foi possível converter a imagem.');
  return blob;
}

export function extensaoDoBlob(blob) {
  if (blob.type === 'image/webp') return 'webp';
  if (blob.type === 'image/png') return 'png';
  return 'jpg';
}
