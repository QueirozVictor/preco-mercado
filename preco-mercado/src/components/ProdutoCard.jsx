import { Link } from 'react-router-dom';
import { formatarIene } from '../utils/formatarIene';
import SeloPreco from './SeloPreco';

export default function ProdutoCard({ produto, resumo, mercadoAtual }) {
  const preco = resumo.semPrecos ? null : resumo.noMercado ?? resumo.menor;

  return (
    <Link to={`/produto/${produto.id}`} className="produto-card">
      <div className="produto-card__foto">
        {produto.fotoUrl ? (
          <img src={produto.fotoUrl} alt={produto.nome} loading="lazy" />
        ) : (
          <span>sem foto</span>
        )}
      </div>
      <div className="produto-card__texto">
        <h2>{produto.nome}</h2>
        {produto.descricao && <p className="texto-suave">{produto.descricao}</p>}
        {preco ? (
          <>
            <p className="produto-card__preco">{formatarIene(preco.valor)}</p>
            <p className="texto-suave">
              {resumo.noMercado
                ? `Em ${mercadoAtual?.nome ?? 'aqui'}`
                : `Menor: ${resumo.menor.mercadoNome}`}
            </p>
            {resumo.noMercado && resumo.comparacaoAqui?.tipo === 'caro' && (
              <p className="texto-suave">
                Menor já visto: {formatarIene(resumo.menor.valor)} · {resumo.menor.mercadoNome}
              </p>
            )}
            <SeloPreco comparacao={resumo.comparacaoAqui} />
          </>
        ) : (
          <p className="texto-suave">Sem preços ainda</p>
        )}
      </div>
    </Link>
  );
}
