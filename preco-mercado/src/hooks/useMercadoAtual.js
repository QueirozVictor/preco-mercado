import { useCallback, useState } from 'react';

const CHAVE = 'preco-mercado:mercado-atual';

function ler() {
  try {
    return localStorage.getItem(CHAVE) || '';
  } catch {
    return '';
  }
}

// Lembra em qual mercado você está agora (só neste aparelho).
export function useMercadoAtual() {
  const [mercadoAtualId, setId] = useState(ler);

  const definirMercadoAtual = useCallback((id) => {
    setId(id);
    try {
      if (id) localStorage.setItem(CHAVE, id);
      else localStorage.removeItem(CHAVE);
    } catch {
      /* sem armazenamento: continua só em memória */
    }
  }, []);

  return [mercadoAtualId, definirMercadoAtual];
}
