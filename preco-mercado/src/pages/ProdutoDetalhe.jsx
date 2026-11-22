import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProduto } from '../hooks/useProdutos';
import { resumirProduto, valorComImposto } from '../utils/comparacao';
import { formatarData, formatarIene } from '../utils/formatarIene';
import { excluirProduto } from '../services/produtosService';
import { removerPreco } from '../services/precosService';
import Mensagem from '../components/Mensagem';

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { produto, carregando, erro, recarregar } = useProduto(id);
  const [erroAcao, setErroAcao] = useState(null);

  const resumo = useMemo(() => (produto ? resumirProduto(produto) : null), [produto]);

  async function handleRemoverPreco(precoId) {
    if (!window.confirm('Remover este preço?')) return;
    setErroAcao(null);
    try {
      await removerPreco(precoId);
      await recarregar();
    } catch (e) {
      setErroAcao(e.message);
    }
  }

  async function handleExcluirProduto() {
    if (!window.confirm(`Excluir "${produto.nome}" e todos os preços dele?`)) return;
    setErroAcao(null);
    try {
      await excluirProduto(produto);
      navegar('/', { replace: true });
    } catch (e) {
      setErroAcao(e.message);
    }
  }

  if (carregando) return <Mensagem>Carregando…</Mensagem>;
  if (erro || !produto) return <Mensagem tipo="erro">{erro ?? 'Produto não encontrado.'}</Mensagem>;

  const historico = [...produto.precos].sort((a, b) => b.observado_em.localeCompare(a.observado_em));

  return (
    <article className="detalhe">
      <Link to="/">← Voltar ao catálogo</Link>

      <div className="detalhe__topo">
        <div className="detalhe__foto">
          {produto.fotoUrl ? <img src={produto.fotoUrl} alt={produto.nome} /> : <span>sem foto</span>}
        </div>
        <div>
          <h1>{produto.nome}</h1>
          {produto.descricao && <p className="texto-suave">{produto.descricao}</p>}
          {!resumo.semPrecos && (
            <p>
              Menor: <strong>{formatarIene(resumo.menor.valor)}</strong> ({resumo.menor.mercadoNome}) ·
              Média: <strong>{formatarIene(resumo.media)}</strong>
            </p>
          )}
          <Link className="botao botao--primario" to={`/registrar?produto=${produto.id}`}>
            Registrar preço
          </Link>
        </div>
      </div>

      {erroAcao && <Mensagem tipo="erro">{erroAcao}</Mensagem>}

      <h2>Por mercado (último preço)</h2>
      {resumo.semPrecos ? (
        <Mensagem>Sem preços registrados.</Mensagem>
      ) : (
        <ul className="lista-simples">
          {resumo.ultimos.map((p) => (
            <li key={p.mercado_id}>
              <span>{p.mercadoNome}</span>
              <span>{formatarIene(p.valor)} <small className="texto-suave">{formatarData(p.observado_em)}</small></span>
            </li>
          ))}
        </ul>
      )}

      <h2>Histórico</h2>
      <ul className="lista-simples">
        {historico.map((p) => (
          <li key={p.id}>
            <span>{formatarData(p.observado_em)} · {p.mercados?.nome ?? '—'}</span>
            <span>
              {formatarIene(valorComImposto(p))}
              {!p.com_imposto && <small className="texto-suave"> (税抜 {formatarIene(p.preco_yen)} + imposto)</small>}
              {' '}
              <button type="button" className="botao botao--texto" onClick={() => handleRemoverPreco(p.id)}>
                Remover
              </button>
            </span>
          </li>
        ))}
      </ul>

      <button type="button" className="botao botao--perigo" onClick={handleExcluirProduto}>
        Excluir produto
      </button>
    </article>
  );
}
