import { useCallback, useEffect, useState } from 'react';
import { listarMercados } from '../services/mercadosService';

export function useMercados() {
  const [mercados, setMercados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setMercados(await listarMercados());
    } catch (e) {
      setErro(e.message ?? 'Erro ao carregar os mercados.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { mercados, carregando, erro, recarregar };
}
