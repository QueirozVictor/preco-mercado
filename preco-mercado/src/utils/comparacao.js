// Regras de comparação de preços (sem React, sem Supabase: fácil de testar).

// Imposto sobre alimentos no Japão (軽減税率). Usado para comparar preços 税抜 com 税込.
export const TAXA_ALIMENTO = 0.08;

export function valorComImposto(preco) {
  return preco.com_imposto
    ? preco.preco_yen
    : Math.round(preco.preco_yen * (1 + TAXA_ALIMENTO));
}

// Último preço registrado em cada mercado. `precos` deve vir ordenado por observado_em crescente.
export function ultimoPrecoPorMercado(precos = []) {
  const mapa = new Map();
  for (const preco of precos) {
    const atual = mapa.get(preco.mercado_id);
    if (!atual || preco.observado_em >= atual.observado_em) mapa.set(preco.mercado_id, preco);
  }
  return mapa;
}

/**
 * Resume um produto: menor preço, média e preço no mercado onde você está.
 * Retorna { semPrecos: true } se o produto ainda não tem preços.
 */
export function resumirProduto(produto, mercadoAtualId = null) {
  const ultimos = [...ultimoPrecoPorMercado(produto.precos).values()].map((preco) => ({
    ...preco,
    valor: valorComImposto(preco),
    mercadoNome: preco.mercados?.nome ?? '—',
  }));

  if (ultimos.length === 0) return { semPrecos: true, ultimos: [] };

  const menor = ultimos.reduce((a, b) => (b.valor < a.valor ? b : a));
  const media = Math.round(ultimos.reduce((soma, p) => soma + p.valor, 0) / ultimos.length);
  const noMercado = mercadoAtualId
    ? ultimos.find((p) => p.mercado_id === mercadoAtualId) ?? null
    : null;

  return {
    semPrecos: false,
    ultimos: [...ultimos].sort((a, b) => a.valor - b.valor),
    menor,
    media,
    noMercado,
    comparacaoAqui: noMercado ? compararPreco(noMercado.valor, { menor, media }) : null,
  };
}

/**
 * Compara um valor (já com imposto) com o histórico do produto.
 * tipo: 'menor' (igual ou abaixo do menor já visto) | 'caro' | 'sem-historico'
 * pct: diferença em relação ao menor (0.11 = 11% mais caro; negativo = abaixo do menor)
 */
export function compararPreco(valor, resumo) {
  if (!resumo || resumo.semPrecos) return { tipo: 'sem-historico' };
  const pct = (valor - resumo.menor.valor) / resumo.menor.valor;
  return {
    tipo: pct <= 0 ? 'menor' : 'caro',
    pct,
    menorValor: resumo.menor.valor,
    menorMercado: resumo.menor.mercadoNome,
    mediaValor: resumo.media,
  };
}
