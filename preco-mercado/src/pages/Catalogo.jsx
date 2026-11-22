import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProdutos } from '../hooks/useProdutos';
import { useMercados } from '../hooks/useMercados';
import { useMercadoAtual } from '../hooks/useMercadoAtual';
import { resumirProduto } from '../utils/comparacao';
import ProdutoCard from '../components/ProdutoCard';
import Mensagem from '../components/Mensagem';

const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase();

export default function Catalogo() {
  const { produtos, carregando, erro } = useProdutos();
  const { mercados } = useMercados();
  const [mercadoAtualId, definirMercadoAtual] = useMercadoAtual();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'caro' | 'menor'

  const mercadoAtual = mercados.find((m) => m.id === mercadoAtualId) ?? null;

  const itens = useMemo(() => {
    const consulta = normalizar(busca.trim());
    return produtos
      .map((produto) => ({ produto, resumo: resumirProduto(produto, mercadoAtual?.id) }))
      .filter(({ produto }) => !consulta || normalizar(produto.nome).includes(consulta))
      .filter(({ resumo }) => {
        if (filtro === 'todos' || !mercadoAtual) return true;
        return resumo.comparacaoAqui?.tipo === filtro;
      });
  }, [produtos, busca, filtro, mercadoAtual]);

  return (
    <section>
      <div className="barra">
        <div className="campo">
          <label htmlFor="mercado-atual">Estou no mercado</label>
          <select id="mercado-atual" value={mercadoAtualId}
            onChange={(e) => { definirMercadoAtual(e.target.value); setFiltro('todos'); }}>
            <option value="">Nenhum escolhido</option>
            {mercados.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="busca">Buscar produto</label>
          <input id="busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </div>

      {mercadoAtual && (
        <div className="filtros" role="group" aria-label="Filtrar por preço neste mercado">
          {[['todos', 'Todos'], ['menor', 'Mais barato aqui'], ['caro', 'Mais caro aqui']].map(([valor, rotulo]) => (
            <button key={valor} type="button" aria-pressed={filtro === valor}
              className={`botao botao--filtro${filtro === valor ? ' ativo' : ''}`}
              onClick={() => setFiltro(valor)}>
              {rotulo}
            </button>
          ))}
        </div>
      )}

      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {carregando && <Mensagem>Carregando produtos…</Mensagem>}

      {!carregando && !erro && produtos.length === 0 && (
        <Mensagem>
          Nenhum produto ainda. <Link to="/registrar">Registre o primeiro preço</Link>.
        </Mensagem>
      )}
      {!carregando && produtos.length > 0 && itens.length === 0 && (
        <Mensagem>Nenhum produto encontrado.</Mensagem>
      )}

      <div className="lista-produtos">
        {itens.map(({ produto, resumo }) => (
          <ProdutoCard key={produto.id} produto={produto} resumo={resumo} mercadoAtual={mercadoAtual} />
        ))}
      </div>
    </section>
  );
}
