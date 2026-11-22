import { useCallback, useEffect, useState } from 'react';
import { buscarProduto, listarProdutos } from '../services/produtosService';

export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setProdutos(await listarProdutos());
    } catch (e) {
      setErro(e.message ?? 'Erro ao carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { produtos, carregando, erro, recarregar };
}

export function useProduto(id) {
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setProduto(await buscarProduto(id));
    } catch (e) {
      setErro(e.message ?? 'Erro ao carregar o produto.');
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { produto, carregando, erro, recarregar };
}
