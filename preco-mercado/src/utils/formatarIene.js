const formatadorIene = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});

export function formatarIene(valor) {
  return formatadorIene.format(Number(valor));
}

// 'YYYY-MM-DD' -> '22/11/2026' (sem deslocamento de fuso)
export function formatarData(dataIso) {
  if (!dataIso) return '';
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function hojeIso() {
  return new Date().toLocaleDateString('sv-SE'); // formato YYYY-MM-DD no fuso local
}
