import { useState, useMemo } from 'react';
import { ProjetoCompleto } from '@/lib/types';
import { calcularProjetoCompleto } from '@/lib/calculos';
import { fmtBRL, fmtPct } from '@/lib/formatters';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, CheckCircle, Printer } from 'lucide-react';

const GOLD = '#C9A84C';
const GREEN = '#34D399';
const RED = '#F87171';
const YELLOW = '#FBBF24';
const BLUE = '#60A5FA';
const CARD_BG = '#1A2035';

interface DashboardProps {
  resultado: ProjetoCompleto;
}

function ScoreCircle({ score }: { score: number }) {
  const r = 42, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? GREEN : score >= 55 ? YELLOW : score >= 35 ? YELLOW : RED;
  return (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(225,25%,20%)" strokeWidth="6" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 50 50)" className="transition-all duration-1000 ease-out" />
      <text x="50" y="48" textAnchor="middle" fill={color} className="font-display" fontSize="24" fontWeight="700">{score}</text>
      <text x="50" y="64" textAnchor="middle" fill="#8892A8" fontSize="9">pontos</text>
    </svg>
  );
}

function KPICard({ label, value, detail, status }: { label: string; value: string; detail?: string; status: 'ok' | 'warn' | 'bad' }) {
  const color = status === 'ok' ? 'text-success' : status === 'warn' ? 'text-warning' : 'text-destructive';
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:-translate-y-0.5 transition-transform duration-300">
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
      {detail && <p className="text-[11px] text-muted-foreground mt-1">{detail}</p>}
    </div>
  );
}

export default function DashboardPage({ resultado }: DashboardProps) {
  const [cenarioSel, setCenarioSel] = useState<'A' | 'B' | 'C'>('B');
  const c = resultado.cenarios[cenarioSel];
  const { mercado, parecer, auditChecks, inputs } = resultado;
  const vgvEfetivo = Math.max(inputs.valorVenda, inputs.precoMercado * inputs.areaConstruida);
  const bufferBE = vgvEfetivo > 0 ? (vgvEfetivo - c.breakEvenVGV) / vgvEfetivo : 0;
  const spreadTIR = c.tir - inputs.tma;

  const fluxoAcum = useMemo(() => c.fluxosCaixa.reduce<{ mes: number; valor: number; fase: string }[]>((acc, fc, i) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].valor : 0;
    const fase = i === 0 ? 'Início' : i <= inputs.mesesPreObra ? 'Pré-Obra' : i <= inputs.mesesPreObra + inputs.mesesObra ? 'Obra' : 'Pós-Obra';
    acc.push({ mes: i, valor: prev + fc, fase });
    return acc;
  }, []), [c.fluxosCaixa, inputs.mesesPreObra, inputs.mesesObra]);

  const donutData = [
    { name: 'Terreno', value: inputs.valorLote },
    { name: 'Construção', value: resultado.custoTotalConstrucao },
    { name: 'Pré-Obra', value: resultado.totalPreObra },
    { name: 'Durante Obra', value: resultado.totalDuranteObra },
    { name: 'Pós-Obra', value: c.totalPos },
    { name: 'Comissão/IR', value: vgvEfetivo * inputs.comissao + c.irValor },
  ];
  const donutColors = ['#60A5FA', '#C9A84C', '#A78BFA', '#F472B6', '#FB923C', '#F87171'];

  const compData = [
    ...inputs.comparaveis.filter(cv => cv.area > 0).map(cv => ({ name: cv.descricao.substring(0, 20), value: cv.preco / cv.area })),
    { name: inputs.nome, value: vgvEfetivo / inputs.areaConstruida }
  ];

  const cenBarData = [
    { name: 'ROE', A: resultado.cenarios.A.roe * 100, B: resultado.cenarios.B.roe * 100, C: resultado.cenarios.C.roe * 100 },
    { name: 'Margem', A: resultado.cenarios.A.margem * 100, B: resultado.cenarios.B.margem * 100, C: resultado.cenarios.C.margem * 100 },
    { name: 'TIR', A: resultado.cenarios.A.tir * 100, B: resultado.cenarios.B.tir * 100, C: resultado.cenarios.C.tir * 100 },
  ];

  // Sensitivity tables
  const deltas = [-0.10, -0.05, 0, 0.05, 0.10];
  const mesesOptions = [1, 3, 6, 9, 12];
  const ltvOptions = [0.60, 0.70, 0.80, 0.90];
  const deltaTaxa = [-0.02, -0.01, 0, 0.01, 0.02];

  const sensROE = useMemo(() => deltas.map(dVGV => {
    const row: Record<string, number | string> = { deltaVGV: `${dVGV >= 0 ? '+' : ''}${(dVGV * 100).toFixed(0)}%` };
    deltas.forEach(dCusto => {
      const r = calcularProjetoCompleto({ ...inputs, valorVenda: inputs.valorVenda * (1 + dVGV), custoPorM2: inputs.custoPorM2 * (1 + dCusto) });
      row[`${(dCusto * 100).toFixed(0)}%`] = r.cenarios[cenarioSel].roe;
    });
    return row;
  }), [inputs, cenarioSel]);

  const sensMargem = useMemo(() => deltas.map(dVGV => {
    const row: Record<string, number | string> = { deltaVGV: `${dVGV >= 0 ? '+' : ''}${(dVGV * 100).toFixed(0)}%` };
    mesesOptions.forEach(m => {
      const modI = { ...inputs, valorVenda: inputs.valorVenda * (1 + dVGV), mesesPosA: m, mesesPosB: m, mesesPosC: m };
      const r = calcularProjetoCompleto(modI);
      row[`${m}m`] = r.cenarios[cenarioSel].margem;
    });
    return row;
  }), [inputs, cenarioSel]);

  const sensExposicao = useMemo(() => deltaTaxa.map(dt => {
    const row: Record<string, number | string> = { deltaTaxa: `${dt >= 0 ? '+' : ''}${(dt * 100).toFixed(0)}pp` };
    ltvOptions.forEach(ltv => {
      const r = calcularProjetoCompleto({ ...inputs, taxaAnual: inputs.taxaAnual + dt, percLTV: ltv });
      row[`${(ltv * 100).toFixed(0)}%`] = r.cenarios[cenarioSel].exposicaoMaxima;
    });
    return row;
  }), [inputs, cenarioSel]);

  const checksOK = auditChecks.filter(ch => ch.status === 'ok').length;

  function cellColor(val: number, thresholds: [number, number]): string {
    if (val >= thresholds[0]) return 'bg-success/20 text-success';
    if (val >= thresholds[1]) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  }
  function cellColorExp(val: number): string {
    if (val < 600000) return 'bg-success/20 text-success';
    if (val < 850000) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  }

  const badgeColor = parecer.score >= 75 ? 'bg-success/20 text-success border-success/30'
    : parecer.score >= 55 ? 'bg-warning/20 text-warning border-warning/30'
    : parecer.score >= 35 ? 'bg-warning/20 text-warning border-warning/30'
    : 'bg-destructive/20 text-destructive border-destructive/30';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-foreground">Dashboard Executivo</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-0.5">
            {(['A', 'B', 'C'] as const).map(s => (
              <button key={s} onClick={() => setCenarioSel(s)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${cenarioSel === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                Cenário {s}
              </button>
            ))}
          </div>
          <button onClick={() => window.print()} className="p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="ROE" value={fmtPct(c.roe)} detail="Meta > 100%" status={c.roe >= 1 ? 'ok' : c.roe >= 0.3 ? 'warn' : 'bad'} />
        <KPICard label="Margem Líquida" value={fmtPct(c.margem)} detail="Meta > 25%" status={c.margem >= 0.25 ? 'ok' : c.margem >= 0.15 ? 'warn' : 'bad'} />
        <KPICard label="TIR Equity a.a." value={fmtPct(c.tir)} detail={`Spread: ${spreadTIR > 0 ? '+' : ''}${(spreadTIR * 100).toFixed(1)}pp`} status={c.tir > inputs.tma ? 'ok' : 'bad'} />
        <KPICard label="VPL Equity" value={fmtBRL(c.vpl)} status={c.vpl > 0 ? 'ok' : 'bad'} />
        <KPICard label="Lucro Líquido" value={fmtBRL(c.lucroLiquido)} status={c.lucroLiquido > 0 ? 'ok' : 'bad'} />
        <KPICard label="MOIC" value={`${c.moic.toFixed(2)}x`} detail="Meta > 1,5x" status={c.moic >= 1.5 ? 'ok' : c.moic >= 1 ? 'warn' : 'bad'} />
        <KPICard label="Payback Descontado" value={`${c.paybackDescontado} meses`} status={c.paybackDescontado <= c.duracaoTotal ? 'ok' : 'bad'} />
        <KPICard label="Exposição Máx." value={fmtBRL(c.exposicaoMaxima)} detail={`${((c.exposicaoMaxima / vgvEfetivo) * 100).toFixed(1)}% do VGV`} status={c.exposicaoMaxima / vgvEfetivo < 0.4 ? 'ok' : 'warn'} />
      </div>

      {/* Parecer + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5 space-y-4">
          <h2 className="font-display text-lg">Parecer Executivo</h2>
          <span className={`inline-block px-4 py-1.5 rounded-lg text-sm font-bold border ${badgeColor}`}>
            {parecer.recomendacao}
          </span>
          {parecer.alertas.length > 0 && (
            <div className="space-y-1.5">
              {parecer.alertas.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-warning">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {a}
                </div>
              ))}
            </div>
          )}
          {parecer.positivos.length > 0 && (
            <div className="space-y-1.5">
              {parecer.positivos.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-success">
                  <CheckCircle size={14} className="mt-0.5 shrink-0" /> {p}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col items-center justify-center gap-4">
          <ScoreCircle score={parecer.score} />
          <div className="w-full space-y-2">
            {[
              { label: 'Retorno', val: Math.min(100, c.roe * 100) },
              { label: 'Margem', val: Math.min(100, c.margem * 400) },
              { label: 'Mercado', val: Math.min(100, (1 - mercado.desvioPreco) * 100) },
              { label: 'Break-even', val: Math.min(100, bufferBE * 333) },
            ].map(b => (
              <div key={b.label} className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>{b.label}</span><span>{Math.round(Math.max(0, b.val))}%</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, b.val))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparativo Cenários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 overflow-x-auto">
          <h2 className="font-display text-lg mb-3">Comparativo de Cenários</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-muted-foreground text-xs">
              <th className="text-left py-2">Indicador</th><th className="text-right py-2">A</th><th className="text-right py-2">B</th><th className="text-right py-2">C</th>
            </tr></thead>
            <tbody className="font-mono">
              {[
                ['Lucro Líq.', (r: typeof resultado) => [fmtBRL(r.cenarios.A.lucroLiquido), fmtBRL(r.cenarios.B.lucroLiquido), fmtBRL(r.cenarios.C.lucroLiquido)]],
                ['ROE', (r: typeof resultado) => [fmtPct(r.cenarios.A.roe), fmtPct(r.cenarios.B.roe), fmtPct(r.cenarios.C.roe)]],
                ['Margem', (r: typeof resultado) => [fmtPct(r.cenarios.A.margem), fmtPct(r.cenarios.B.margem), fmtPct(r.cenarios.C.margem)]],
                ['Exposição', (r: typeof resultado) => [fmtBRL(r.cenarios.A.exposicaoMaxima), fmtBRL(r.cenarios.B.exposicaoMaxima), fmtBRL(r.cenarios.C.exposicaoMaxima)]],
                ['Pós-Obra', (r: typeof resultado) => [fmtBRL(r.cenarios.A.totalPos), fmtBRL(r.cenarios.B.totalPos), fmtBRL(r.cenarios.C.totalPos)]],
                ['Duração', (r: typeof resultado) => [`${r.cenarios.A.duracaoTotal}m`, `${r.cenarios.B.duracaoTotal}m`, `${r.cenarios.C.duracaoTotal}m`]],
              ].map(([label, fn]) => {
                const vals = (fn as (r: typeof resultado) => string[])(resultado);
                return (
                  <tr key={label as string} className="border-b border-border/50">
                    <td className="py-2">{label as string}</td>
                    {vals.map((v, i) => <td key={i} className="text-right py-2">{v}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-display text-lg mb-3">ROE / Margem / TIR por Cenário</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cenBarData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,25%,20%)" />
              <XAxis dataKey="name" tick={{ fill: '#8892A8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8892A8', fontSize: 11 }} tickFormatter={v => `${v.toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: CARD_BG, border: '1px solid hsl(225,25%,25%)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="A" fill={GREEN} radius={[4, 4, 0, 0]} name="Cenário A" />
              <Bar dataKey="B" fill={GOLD} radius={[4, 4, 0, 0]} name="Cenário B" />
              <Bar dataKey="C" fill={RED} radius={[4, 4, 0, 0]} name="Cenário C" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fluxo de Caixa */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="font-display text-lg mb-3">Fluxo de Caixa Acumulado — Cenário {cenarioSel}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={fluxoAcum}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,25%,20%)" />
            <XAxis dataKey="mes" tick={{ fill: '#8892A8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8892A8', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: CARD_BG, border: '1px solid hsl(225,25%,25%)', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [fmtBRL(v), 'Acumulado']}
              labelFormatter={(l) => { const pt = fluxoAcum[l as number]; return pt ? `Mês ${l} — ${pt.fase}` : `Mês ${l}`; }} />
            <ReferenceLine y={0} stroke="#8892A8" strokeDasharray="6 3" />
            <Area type="monotone" dataKey="valor" stroke={GOLD} fill="url(#goldGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Composição de Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-display text-lg mb-3">Composição de Custos</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                {donutData.map((_, i) => <Cell key={i} fill={donutColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: CARD_BG, border: '1px solid hsl(225,25%,25%)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmtBRL(v)]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-lg p-5 overflow-x-auto">
          <h2 className="font-display text-lg mb-3">Detalhamento</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-muted-foreground text-xs"><th className="text-left py-2">Categoria</th><th className="text-right py-2">Valor</th><th className="text-right py-2">%</th></tr></thead>
            <tbody className="font-mono">
              {donutData.map((d, i) => {
                const total = donutData.reduce((s, v) => s + v.value, 0);
                return (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: donutColors[i] }} />{d.name}</td>
                    <td className="text-right">{fmtBRL(d.value)}</td>
                    <td className="text-right">{((d.value / total) * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análise de Mercado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-display text-lg mb-3">Comparáveis (R$/m²)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,25%,20%)" />
              <XAxis type="number" tick={{ fill: '#8892A8', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#8892A8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: CARD_BG, border: '1px solid hsl(225,25%,25%)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} /m²`]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {compData.map((_, i) => <Cell key={i} fill={i === compData.length - 1 ? GOLD : BLUE} />)}
              </Bar>
              <ReferenceLine x={mercado.medianaComps} stroke={YELLOW} strokeDasharray="4 4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <h2 className="font-display text-lg">Indicadores de Mercado</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: 'Mediana R$/m²', v: fmtBRL(mercado.medianaComps) },
              { l: 'Média R$/m²', v: fmtBRL(mercado.mediaComps) },
              { l: 'Desvio vs modelo', v: fmtPct(mercado.desvioPreco) },
              { l: 'Buffer break-even', v: fmtPct(bufferBE) },
            ].map(x => (
              <div key={x.l} className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground">{x.l}</p>
                <p className="font-mono text-sm">{x.v}</p>
              </div>
            ))}
          </div>
          <div className={`rounded-lg p-3 text-sm font-medium ${mercado.desvioPreco <= 0.05 ? 'bg-success/10 text-success' : mercado.desvioPreco <= 0.15 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
            {mercado.alertaMercado}
          </div>
        </div>
      </div>

      {/* Sensibilidade */}
      <div className="space-y-4">
        <h2 className="font-display text-lg">Análise de Sensibilidade</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
            <p className="text-xs text-muted-foreground mb-2 font-medium">ROE × (ΔVGV vs ΔCusto)</p>
            <table className="w-full text-[11px]">
              <thead><tr className="text-muted-foreground"><th className="py-1 text-left">ΔVGV\ΔCusto</th>{deltas.map(d => <th key={d} className="py-1 text-center">{d >= 0 ? '+' : ''}{(d * 100).toFixed(0)}%</th>)}</tr></thead>
              <tbody className="font-mono">{sensROE.map((row, i) => (
                <tr key={i}><td className="py-1 text-muted-foreground">{row.deltaVGV as string}</td>
                  {deltas.map(d => { const v = row[`${(d * 100).toFixed(0)}%`] as number; return <td key={d} className={`py-1 text-center rounded ${cellColor(v, [0.6, 0.3])}`}>{(v * 100).toFixed(0)}%</td>; })}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Margem × (ΔVGV vs Meses Pós)</p>
            <table className="w-full text-[11px]">
              <thead><tr className="text-muted-foreground"><th className="py-1 text-left">ΔVGV\Meses</th>{mesesOptions.map(m => <th key={m} className="py-1 text-center">{m}m</th>)}</tr></thead>
              <tbody className="font-mono">{sensMargem.map((row, i) => (
                <tr key={i}><td className="py-1 text-muted-foreground">{row.deltaVGV as string}</td>
                  {mesesOptions.map(m => { const v = row[`${m}m`] as number; return <td key={m} className={`py-1 text-center rounded ${cellColor(v, [0.2, 0.1])}`}>{(v * 100).toFixed(0)}%</td>; })}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Exposição × (ΔTaxa vs LTV)</p>
            <table className="w-full text-[11px]">
              <thead><tr className="text-muted-foreground"><th className="py-1 text-left">ΔTaxa\LTV</th>{ltvOptions.map(l => <th key={l} className="py-1 text-center">{(l * 100).toFixed(0)}%</th>)}</tr></thead>
              <tbody className="font-mono">{sensExposicao.map((row, i) => (
                <tr key={i}><td className="py-1 text-muted-foreground">{row.deltaTaxa as string}</td>
                  {ltvOptions.map(l => { const v = row[`${(l * 100).toFixed(0)}%`] as number; return <td key={l} className={`py-1 text-center rounded ${cellColorExp(v)}`}>{(v / 1000).toFixed(0)}k</td>; })}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Auditoria */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Auditoria do Modelo</h2>
          <span className="text-sm font-mono text-muted-foreground">{checksOK}/{auditChecks.length} OK ({((checksOK / auditChecks.length) * 100).toFixed(0)}%)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {auditChecks.map((check, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/20">
              <span className="text-sm mt-0.5">{check.status === 'ok' ? '✅' : check.status === 'warn' ? '⚠️' : '❌'}</span>
              <div><p className="text-xs font-medium">{check.label}</p><p className="text-[10px] text-muted-foreground">{check.detail}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
