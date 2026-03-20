export function fmtBRL(v: number): string {
  if (v === 0) return '—';
  if (v < 0) return `(R$ ${Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})`;
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function fmtPct(v: number, decimals = 1): string {
  if (v === 0) return '—';
  return `${(v * 100).toFixed(decimals)}%`.replace('.', ',');
}

export function fmtNum(v: number, decimals = 0): string {
  if (v === 0) return '—';
  return v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
