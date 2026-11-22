import { useEffect, useState } from 'react';
import { converterImagem } from '../utils/converterImagem';

// Abre a câmera no celular, converte a foto (WebP, até 1024px) e entrega o Blob ao formulário.
export default function FotoUpload({ onChange }) {
  const [previa, setPrevia] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => () => previa && URL.revokeObjectURL(previa), [previa]);

  async function handleArquivo(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setErro(null);
    setProcessando(true);
    try {
      const blob = await converterImagem(arquivo);
      setPrevia(URL.createObjectURL(blob));
      onChange(blob);
    } catch (e) {
      setErro(e.message);
      onChange(null);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="foto-upload">
      <label htmlFor="foto">Foto do produto</label>
      <input id="foto" type="file" accept="image/*" capture="environment" onChange={handleArquivo} />
      {processando && <p className="texto-suave">Convertendo a imagem…</p>}
      {erro && <p className="mensagem mensagem--erro" role="alert">{erro}</p>}
      {previa && <img className="foto-upload__previa" src={previa} alt="Prévia da foto escolhida" />}
    </div>
  );
}
