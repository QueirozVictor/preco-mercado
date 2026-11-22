import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProdutos } from '../hooks/useProdutos';
import { useMercados } from '../hooks/useMercados';
import { useMercadoAtual } from '../hooks/useMercadoAtual';
import { compararPreco, resumirProduto, TAXA_ALIMENTO } from '../utils/comparacao';
import { formatarIene, hojeIso } from '../utils/formatarIene';
import { criarProduto } from '../services/produtosService';
import { criarMercado } from '../services/mercadosService';
import { criarPreco } from '../services/precosService';
import { enviarFoto } from '../services/fotosService';
import FotoUpload from '../components/FotoUpload';
import SeloPreco from '../components/SeloPreco';
import Mensagem from '../components/Mensagem';

export default function RegistrarPreco() {
  const { usuario } = useAuth();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const { produtos, carregando: carregandoProdutos } = useProdutos();
  const { mercados, recarregar: recarregarMercados } = useMercados();
  const [mercadoAtualId, definirMercadoAtual] = useMercadoAtual();

  const [produtoId, setProdutoId] = useState(params.get('produto') ?? ''); // '' | 'novo' | id
  const [nomeProduto, setNomeProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);
  const [mercadoId, setMercadoId] = useState(mercadoAtualId); // '' | 'novo' | id
  const [nomeMercado, setNomeMercado] = useState('');
  const [cidadeMercado, setCidadeMercado] = useState('');
  const [preco, setPreco] = useState('');
  const [comImposto, setComImposto] = useState(true);
  const [data, setData] = useState(hojeIso());
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const produtoExistente = produtos.find((p) => p.id === produtoId) ?? null;
  const valorNumerico = Number(preco);
  const precoValido = Number.isInteger(valorNumerico) && valorNumerico > 0;

  // Comparação ao vivo: digitou o preço do mercado, já vê se está caro ou barato.
  const comparacao = useMemo(() => {
    if (!produtoExistente || !precoValido) return null;
    const valor = comImposto ? valorNumerico : Math.round(valorNumerico * (1 + TAXA_ALIMENTO));
    return compararPreco(valor, resumirProduto(produtoExistente));
  }, [produtoExistente, precoValido, valorNumerico, comImposto]);

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro(null);

    if (!produtoId) return setErro('Escolha um produto ou crie um novo.');
    if (!mercadoId) return setErro('Escolha um mercado ou crie um novo.');
    if (!precoValido) return setErro('Informe o preço em ienes (número inteiro).');

    setEnviando(true);
    try {
      let idProduto = produtoId;
      if (produtoId === 'novo') {
        const caminho = foto ? await enviarFoto(foto, usuario.id) : null;
        const novo = await criarProduto({ nome: nomeProduto, descricao, foto_path: caminho });
        idProduto = novo.id;
      }

      let idMercado = mercadoId;
      if (mercadoId === 'novo') {
        const novo = await criarMercado({ nome: nomeMercado, cidade: cidadeMercado });
        idMercado = novo.id;
        await recarregarMercados();
      }

      await criarPreco({
        produto_id: idProduto,
        mercado_id: idMercado,
        preco_yen: valorNumerico,
        com_imposto: comImposto,
        observado_em: data,
      });

      definirMercadoAtual(idMercado);
      navegar(`/produto/${idProduto}`, { replace: true });
    } catch (e) {
      setErro(e.message ?? 'Não foi possível salvar.');
      setEnviando(false);
    }
  }

  return (
    <section>
      <h1>Registrar preço</h1>
      <form onSubmit={handleSubmit} className="formulario">
        <div className="campo">
          <label htmlFor="produto">Produto</label>
          <select id="produto" value={produtoId} onChange={(e) => setProdutoId(e.target.value)}
            disabled={carregandoProdutos}>
            <option value="">Escolha…</option>
            {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            <option value="novo">+ Novo produto</option>
          </select>
        </div>

        {produtoId === 'novo' && (
          <fieldset className="grupo">
            <legend>Novo produto</legend>
            <div className="campo">
              <label htmlFor="nome-produto">Nome</label>
              <input id="nome-produto" required value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)} />
            </div>
            <div className="campo">
              <label htmlFor="descricao">Descrição (opcional)</label>
              <input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <FotoUpload onChange={setFoto} />
          </fieldset>
        )}

        <div className="campo">
          <label htmlFor="mercado">Mercado</label>
          <select id="mercado" value={mercadoId} onChange={(e) => setMercadoId(e.target.value)}>
            <option value="">Escolha…</option>
            {mercados.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            <option value="novo">+ Novo mercado</option>
          </select>
        </div>

        {mercadoId === 'novo' && (
          <fieldset className="grupo">
            <legend>Novo mercado</legend>
            <div className="campo">
              <label htmlFor="nome-mercado">Nome</label>
              <input id="nome-mercado" required value={nomeMercado}
                onChange={(e) => setNomeMercado(e.target.value)} />
            </div>
            <div className="campo">
              <label htmlFor="cidade">Cidade (opcional)</label>
              <input id="cidade" value={cidadeMercado} onChange={(e) => setCidadeMercado(e.target.value)} />
            </div>
          </fieldset>
        )}

        <div className="campo">
          <label htmlFor="preco">Preço (¥)</label>
          <input id="preco" type="number" inputMode="numeric" min="1" step="1" required
            value={preco} onChange={(e) => setPreco(e.target.value)} />
        </div>

        <label className="campo campo--check">
          <input type="checkbox" checked={comImposto} onChange={(e) => setComImposto(e.target.checked)} />
          Preço já com imposto (税込)
        </label>

        <div className="campo">
          <label htmlFor="data">Data</label>
          <input id="data" type="date" required value={data} max={hojeIso()}
            onChange={(e) => setData(e.target.value)} />
        </div>

        {comparacao?.tipo === 'sem-historico' && (
          <Mensagem>Este produto ainda não tem preços: este será o primeiro.</Mensagem>
        )}
        {comparacao && comparacao.tipo !== 'sem-historico' && (
          <div className="comparacao" role="status">
            <SeloPreco comparacao={comparacao} />
            <p>
              Menor já visto: {formatarIene(comparacao.menorValor)} ({comparacao.menorMercado}) ·
              média {formatarIene(comparacao.mediaValor)}
            </p>
          </div>
        )}

        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}

        <button type="submit" className="botao botao--primario" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar preço'}
        </button>
      </form>
    </section>
  );
}
