// Selo "menor preço" / "+X% mais caro" a partir do resultado de compararPreco().
export default function SeloPreco({ comparacao }) {
  if (!comparacao || comparacao.tipo === 'sem-historico') return null;

  const pct = Math.round(Math.abs(comparacao.pct) * 100);

  if (comparacao.tipo === 'menor') {
    return (
      <span className="selo selo--menor">
        {pct > 0 ? `${pct}% abaixo do menor` : 'Menor preço'}
      </span>
    );
  }
  return <span className="selo selo--caro">+{pct}% mais caro</span>;
}
