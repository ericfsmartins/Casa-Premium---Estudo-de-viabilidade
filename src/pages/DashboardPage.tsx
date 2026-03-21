import { useState, useMemo } from 'react';
import { ProjetoCompleto } from '@/lib/types';
import { calcularProjetoCompleto, calcSaldoDevedor } from '@/lib/calculos';
import { fmtBRL, fmtPct } from '@/lib/formatters';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, CheckCircle, Printer, ChevronDown, ChevronUp, Info, Lightbulb, TrendingUp, Shield, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// Use CSS token-aware colors for charts
const CHART = {
  gold: 'hsl(43, 52%, 54%)',
  green: 'hsl(160, 64%, 52%)',
  red: 'hsl(0, 72%, 71%)',
  yellow: 'hsl(43, 96%, 56%)',
  blue: 'hsl(217, 92%, 68%)',
  purple: 'hsl(271, 60%, 70%)',
  pink: 'hsl(330, 70%, 70%)',
  orange: 'hsl(25, 95%, 60%)',
  cardBg: 'hsl(222, 25%, 11%)',
  grid: 'hsl(222, 18%, 18%)',
  tick: 'hsl(222, 12%, 50%)',
  border: 'hsl(222, 18%, 22%)',
};

const TOOLTIP_STYLE = {
  background: CHART.cardBg,
  border: `1px solid ${CHART.border}`,
  borderRadius: 10,
  fontSize: 12,
  boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5)',
};

interface DashboardProps {
  resultado: ProjetoCompleto;
}

function ScoreCircle({ score }: { score: number }) {
  const r = 44, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? CHART.green : score >= 55 ? CHART.yellow : score >= 35 ? CHART.yellow : CHART.red;
  return (
    <div className="relative">
      <svg width="130" height="130" viewBox="0 0 100 100">
        <defs>
          <filter id="scoreGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(222,18%,15%)" strokeWidth="5" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 50 50)" 
          filter="url(#scoreGlow)"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        <text x="50" y="46" textAnchor="middle" fill={color} className="font-display" fontSize="26" fontWeight="700">{score}</text>
        <text x="50" y="62" textAnchor="middle" fill="hsl(222,12%,45%)" fontSize="9" className="font-body">pontos</text>
      </svg>
    </div>
  );
}

const KPI_TOOLTIPS: Record<string, string> = {
  'ROE': 'Retorno sobre o capital próprio investido',
  'Margem Líquida': 'Percentual do VGV que sobra como lucro',
  'TIR Equity a.a.': 'Taxa interna de retorno anualizada do fluxo de caixa do equity',
  'VPL Equity': 'Valor presente líquido descontado à TMA',
  'Lucro Líquido': 'Receita líquida menos todos os custos e impostos',
  'MOIC': 'Quantas vezes você recupera o capital. Abaixo de 1,5x = pouco atrativo',
  'Payback Desc.': 'Mês em que o fluxo acumulado descontado cruza o zero',
  'Exposição Máx.': 'Pico de caixa comprometido — nunca superar 30% do VGV',
};

function KPICard({ label, value, detail, status, icon, className = '' }: { 
  label: string; value: string; detail?: string; status: 'ok' | 'warn' | 'bad'; 
  icon?: React.ReactNode; className?: string 
}) {
  const color = status === 'ok' ? 'text-success' : status === 'warn' ? 'text-warning' : 'text-destructive';
  const glowColor = status === 'ok' ? 'group-hover:shadow-success/5' : status === 'warn' ? 'group-hover:shadow-warning/5' : 'group-hover:shadow-destructive/5';
  const tooltip = KPI_TOOLTIPS[label];
  return (
    <div className={`kpi-card group ${glowColor} ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        {tooltip && (
          <div className="relative ml-auto">
            <Info size={12} className="text-muted-foreground/40 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-[10px] text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <p className={`font-display text-2xl font-bold ${color} tracking-tight`}>{value}</p>
      {detail && <p className="text-[11px] text-muted-foreground mt-1.5">{detail}</p>}
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false, icon }: { 
  title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: React.ReactNode 
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section-card">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="font-display text-base">{title}</span>
        </div>
        <div className={`p-1 rounded-md bg-muted/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown size={14} className="text-muted-foreground" />
        </div>
      </button>
      {open && <div className="px-5 pb-5 border-t border-border/30 animate-fade">{children}</div>}
    </div>
  );
}

export default function DashboardPage({ resultado }: DashboardProps) {
  const [cenarioSel, setCenarioSel] = useState<'A' | 'B' | 'C'>('B');
  const [sliderMeses, setSliderMeses] = useState<number | null>(null);
  const c = resultado.cenarios[cenarioSel];
  const { mercado, parecer, auditChecks, inputs, cronogramaJuros } = resultado;
  const vgvEfetivo = Math.max(inputs.valorVenda, inputs.precoMercado * inputs.areaConstruida);
  const bufferBE = vgvEfetivo > 0 ? (vgvEfetivo - c.breakEvenVGV) / vgvEfetivo : 0;
  const spreadTIR = c.tir - inputs.tma;
  const carregoMensal = inputs.condominio + inputs.iptuAnual / 12;

  const sliderResult = useMemo(() => {
    if (sliderMeses === null) return null;
    const modInputs = { ...inputs, mesesPosA: sliderMeses, mesesPosB: sliderMeses, mesesPosC: sliderMeses };
    return calcularProjetoCompleto(modInputs).cenarios[cenarioSel];
  }, [sliderMeses, inputs, cenarioSel]);

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
  const donutColors = [CHART.blue, CHART.gold, CHART.purple, CHART.pink, CHART.orange, CHART.red];

  const compData = [
    ...inputs.comparaveis.filter(cv => cv.area > 0).map(cv => ({ name: cv.descricao.substring(0, 20), value: cv.preco / cv.area })),
    { name: inputs.nome, value: vgvEfetivo / inputs.areaConstruida }
  ];

  const cenBarData = [
    { name: 'ROE', A: resultado.cenarios.A.roe * 100, B: resultado.cenarios.B.roe * 100, C: resultado.cenarios.C.roe * 100 },
    { name: 'Margem', A: resultado.cenarios.A.margem * 100, B: resultado.cenarios.B.margem * 100, C: resultado.cenarios.C.margem * 100 },
    { name: 'TIR', A: resultado.cenarios.A.tir * 100, B: resultado.cenarios.B.tir * 100, C: resultado.cenarios.C.tir * 100 },
  ];

  const deltas = [-0.10, -0.05, 0, 0.05, 0.10];
  const mesesOptions = [1, 3, 6, 9, 12];
  const ltvOptions = [0.60, 0.70, 0.80, 0.90];
  const deltaTaxa = [-0.02, -0.01, 0, 0.01, 0.02];

  const sensROE = useMemo(() => deltas.map(dCusto => {
    const row: Record<string, number | string> = { deltaCusto: `${dCusto >= 0 ? '+' : ''}${(dCusto * 100).toFixed(0)}%` };
    deltas.forEach(dVGV => {
      const r = calcularProjetoCompleto({ ...inputs, valorVenda: inputs.valorVenda * (1 + dVGV), custoPorM2: inputs.custoPorM2 * (1 + dCusto) });
      row[`${(dVGV * 100).toFixed(0)}%`] = r.cenarios[cenarioSel].roe;
    });
    return row;
  }), [inputs, cenarioSel]);

  const sensMargem = useMemo(() => deltas.map(dVGV => {
    const row: Record<string, number | string> = { deltaVGV: `${dVGV >= 0 ? '+' : ''}${(dVGV * 100).toFixed(0)}%` };
    mesesOptions.forEach(m => {
      const modI = { ...inputs, valorVenda: inputs.valorVenda * (1 + dVGV), mesesPosA: m, mesesPosB: m, mesesPosC: m };
      row[`${m}m`] = calcularProjetoCompleto(modI).cenarios[cenarioSel].margem;
    });
    return row;
  }), [inputs, cenarioSel]);

  const sensExposicao = useMemo(() => deltaTaxa.map(dt => {
    const row: Record<string, number | string> = { deltaTaxa: `${dt >= 0 ? '+' : ''}${(dt * 100).toFixed(0)}pp` };
    ltvOptions.forEach(ltv => {
      row[`${(ltv * 100).toFixed(0)}%`] = calcularProjetoCompleto({ ...inputs, taxaAnual: inputs.taxaAnual + dt, percLTV: ltv }).cenarios[cenarioSel].exposicaoMaxima;
    });
    return row;
  }), [inputs, cenarioSel]);

  const checksOK = auditChecks.filter(ch => ch.status === 'ok').length;

  function cellColor(val: number, thresholds: [number, number]): string {
    if (val >= thresholds[0]) return 'bg-success/15 text-success';
    if (val >= thresholds[1]) return 'bg-warning/15 text-warning';
    return 'bg-destructive/15 text-destructive';
  }
  function cellColorExp(val: number): string {
    if (val < 600000) return 'bg-success/15 text-success';
    if (val < 850000) return 'bg-warning/15 text-warning';
    return 'bg-destructive/15 text-destructive';
  }

  const badgeColor = parecer.score >= 75 ? 'bg-success/10 text-success border-success/20'
    : parecer.score >= 55 ? 'bg-warning/10 text-warning border-warning/20'
    : parecer.score >= 35 ? 'bg-warning/10 text-warning border-warning/20'
    : 'bg-destructive/10 text-destructive border-destructive/20';

  const faseColor = (fase: string) => {
    if (fase === 'Compra' || fase === 'Início') return 'bg-muted/20';
    if (fase === 'Pré-Obra') return 'bg-info/5';
    if (fase === 'Obra') return 'bg-warning/5';
    return 'bg-success/5';
  };

  const totalJurosObra = cronogramaJuros.reduce((s, r) => s + r.juros, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fade">
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-1">Análise Financeira</p>
          <h1 className="font-display text-2xl md:text-3xl text-foreground tracking-tight">Dashboard Executivo</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary/60 rounded-xl p-1 border border-border/40">
            {(['A', 'B', 'C'] as const).map(s => (
              <button key={s} onClick={() => setCenarioSel(s)}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  cenarioSel === s 
                    ? 'text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={cenarioSel === s ? { background: 'var(--gradient-gold)' } : undefined}>
                {s === 'A' ? '🚀' : s === 'B' ? '📊' : '🐢'} {s}
              </button>
            ))}
          </div>
          <button onClick={() => window.print()} className="btn-ghost p-2.5 rounded-lg">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Alerta estoque cenário C */}
      {cenarioSel === 'C' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/8 border border-warning/20 animate-scale">
          <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-warning/90">
            Com {c.mesesPos} meses de estoque, você paga <strong className="text-warning">{fmtBRL(c.prestacoesPagas)}</strong> em prestações bancárias antes de vender. Priorize a pré-venda na planta.
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="ROE" value={fmtPct(c.roe)} detail="Meta > 100%" status={c.roe >= 1 ? 'ok' : c.roe >= 0.3 ? 'warn' : 'bad'} className="animate-in-1" />
        <KPICard label="Margem Líquida" value={fmtPct(c.margem)} detail="Meta > 25%" status={c.margem >= 0.25 ? 'ok' : c.margem >= 0.15 ? 'warn' : 'bad'} className="animate-in-2" />
        <KPICard label="TIR Equity a.a." value={fmtPct(c.tir)} detail={`Spread: ${spreadTIR > 0 ? '+' : ''}${(spreadTIR * 100).toFixed(1)}pp`} status={c.tir > inputs.tma ? 'ok' : 'bad'} className="animate-in-3" />
        <KPICard label="VPL Equity" value={fmtBRL(c.vpl)} status={c.vpl > 0 ? 'ok' : 'bad'} className="animate-in-4" />
        <KPICard label="Lucro Líquido" value={fmtBRL(c.lucroLiquido)} status={c.lucroLiquido > 0 ? 'ok' : 'bad'} className="animate-in-5" />
        <KPICard label="MOIC" value={`${c.moic.toFixed(2)}x`} detail="Meta > 1,5x" status={c.moic >= 1.5 ? 'ok' : c.moic >= 1 ? 'warn' : 'bad'} className="animate-in-6" />
        <KPICard label="Payback Desc." value={`${c.paybackDescontado}m`} status={c.paybackDescontado <= c.duracaoTotal ? 'ok' : 'bad'} className="animate-in-7" />
        <KPICard label="Exposição Máx." value={fmtBRL(c.exposicaoMaxima)} detail={`${((c.exposicaoMaxima / vgvEfetivo) * 100).toFixed(1)}% do VGV`} status={c.exposicaoMaxima / vgvEfetivo < 0.4 ? 'ok' : 'warn'} className="animate-in-8" />
      </div>

      {/* Parecer + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 section-card p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Shield size={18} className="text-primary" />
            <h2 className="font-display text-lg">Parecer Executivo</h2>
          </div>
          <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold border ${badgeColor}`}>
            {parecer.recomendacao}
          </span>
          {parecer.alertas.length > 0 && (
            <div className="space-y-2 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
              {parecer.alertas.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-warning">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {a}
                </div>
              ))}
            </div>
          )}
          {parecer.positivos.length > 0 && (
            <div className="space-y-2 p-3 rounded-lg bg-success/5 border border-success/10">
              {parecer.positivos.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-success">
                  <CheckCircle size={14} className="mt-0.5 shrink-0" /> {p}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="section-card p-6 flex flex-col items-center justify-center gap-5">
          <ScoreCircle score={parecer.score} />
          <div className="w-full space-y-3">
            {[
              { label: 'Retorno', val: Math.min(100, c.roe * 100) },
              { label: 'Margem', val: Math.min(100, c.margem * 400) },
              { label: 'Mercado', val: Math.min(100, (1 - mercado.desvioPreco) * 100) },
              { label: 'Break-even', val: Math.min(100, bufferBE * 333) },
            ].map(b => (
              <div key={b.label} className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span>{b.label}</span>
                  <span className="font-mono">{Math.round(Math.max(0, b.val))}%</span>
                </div>
                <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-1000 ease-out" 
                       style={{ width: `${Math.max(0, Math.min(100, b.val))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparativo Cenários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="section-card p-5 overflow-x-auto">
          <h2 className="font-display text-lg mb-4">Comparativo de Cenários</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border/50 text-muted-foreground text-xs">
              <th className="text-left py-2.5 font-medium">Indicador</th>
              <th className="text-right py-2.5 font-medium">A 🚀</th>
              <th className="text-right py-2.5 font-medium">B 📊</th>
              <th className="text-right py-2.5 font-medium">C 🐢</th>
            </tr></thead>
            <tbody className="font-mono text-[13px]">
              {[
                ['Lucro Líq.', [fmtBRL(resultado.cenarios.A.lucroLiquido), fmtBRL(resultado.cenarios.B.lucroLiquido), fmtBRL(resultado.cenarios.C.lucroLiquido)]],
                ['ROE', [fmtPct(resultado.cenarios.A.roe), fmtPct(resultado.cenarios.B.roe), fmtPct(resultado.cenarios.C.roe)]],
                ['Margem', [fmtPct(resultado.cenarios.A.margem), fmtPct(resultado.cenarios.B.margem), fmtPct(resultado.cenarios.C.margem)]],
                ['Exposição', [fmtBRL(resultado.cenarios.A.exposicaoMaxima), fmtBRL(resultado.cenarios.B.exposicaoMaxima), fmtBRL(resultado.cenarios.C.exposicaoMaxima)]],
                ['Pós-Obra', [fmtBRL(resultado.cenarios.A.totalPos), fmtBRL(resultado.cenarios.B.totalPos), fmtBRL(resultado.cenarios.C.totalPos)]],
                ['Duração', [`${resultado.cenarios.A.duracaoTotal}m`, `${resultado.cenarios.B.duracaoTotal}m`, `${resultado.cenarios.C.duracaoTotal}m`]],
              ].map(([label, vals]) => (
                <tr key={label as string} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="py-2.5 font-body text-muted-foreground text-xs">{label as string}</td>
                  {(vals as string[]).map((v, i) => <td key={i} className="text-right py-2.5">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="section-card p-5">
          <h2 className="font-display text-lg mb-4">ROE / Margem / TIR por Cenário</h2>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={cenBarData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
              <XAxis dataKey="name" tick={{ fill: CHART.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: CHART.tick, fontSize: 11 }} tickFormatter={v => `${v.toFixed(0)}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="A" fill={CHART.green} radius={[6, 6, 0, 0]} name="Cenário A" />
              <Bar dataKey="B" fill={CHART.gold} radius={[6, 6, 0, 0]} name="Cenário B" />
              <Bar dataKey="C" fill={CHART.red} radius={[6, 6, 0, 0]} name="Cenário C" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Custos Pós-Obra */}
      <div className="section-card p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Zap size={18} className="text-primary" />
          <h2 className="font-display text-lg">Custos Pós-Obra — Cenário {cenarioSel} ({c.mesesPos} meses)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <table className="w-full text-sm font-mono">
              <tbody>
                <tr className="border-b border-border/30"><td className="py-2.5 text-muted-foreground">Carrego (condomínio + IPTU)</td><td className="text-right py-2.5">{fmtBRL(c.carregoPos)}</td></tr>
                <tr className="border-b border-border/30"><td className="py-2.5 text-muted-foreground">Parcelas financiamento ({c.mesesPos}×PMT)</td><td className="text-right py-2.5">{fmtBRL(c.prestacoesPagas)}</td></tr>
                <tr className="border-b border-border/50 font-bold"><td className="py-2.5">TOTAL PÓS-OBRA</td><td className="text-right py-2.5 text-primary">{fmtBRL(c.totalPos)}</td></tr>
                <tr><td className="py-2.5 text-muted-foreground text-xs">Saldo devedor na venda</td><td className="text-right py-2.5 text-muted-foreground text-xs">{fmtBRL(c.saldoNaVenda)}</td></tr>
              </tbody>
            </table>
            <div className="mt-4 flex items-start gap-2.5 bg-primary/8 border border-primary/15 rounded-xl p-3.5 text-xs text-primary">
              <Lightbulb size={14} className="shrink-0 mt-0.5" />
              <span>Cada mês adicional custa <strong>{fmtBRL(resultado.pmt + carregoMensal)}</strong> (PMT {fmtBRL(resultado.pmt)} + carrego {fmtBRL(carregoMensal)})</span>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Simulador de estoque</p>
            <div className="flex items-center gap-3">
              <Slider min={1} max={24} step={1} value={[sliderMeses ?? c.mesesPos]}
                onValueChange={([v]) => setSliderMeses(v)} className="flex-1" />
              <span className="font-mono text-sm text-primary font-semibold min-w-[3ch] text-right">{sliderMeses ?? c.mesesPos}m</span>
            </div>
            {sliderResult && sliderMeses !== null && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono animate-fade">
                <div className="bg-muted/20 rounded-xl p-3 border border-border/30"><span className="text-muted-foreground block mb-1">Pós-Obra</span><span className="font-semibold">{fmtBRL(sliderResult.totalPos)}</span></div>
                <div className="bg-muted/20 rounded-xl p-3 border border-border/30"><span className="text-muted-foreground block mb-1">Saldo Devedor</span><span className="font-semibold">{fmtBRL(sliderResult.saldoNaVenda)}</span></div>
                <div className="bg-muted/20 rounded-xl p-3 border border-border/30"><span className="text-muted-foreground block mb-1">Lucro Líquido</span><span className={`font-semibold ${sliderResult.lucroLiquido > 0 ? 'text-success' : 'text-destructive'}`}>{fmtBRL(sliderResult.lucroLiquido)}</span></div>
                <div className="bg-muted/20 rounded-xl p-3 border border-border/30"><span className="text-muted-foreground block mb-1">ROE</span><span className={`font-semibold ${sliderResult.roe >= 0.3 ? 'text-success' : 'text-destructive'}`}>{fmtPct(sliderResult.roe)}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fluxo de Caixa */}
      <div className="section-card p-5">
        <h2 className="font-display text-lg mb-4">Fluxo de Caixa Acumulado — Cenário {cenarioSel}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={fluxoAcum}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART.gold} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CHART.gold} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
            <XAxis dataKey="mes" tick={{ fill: CHART.tick, fontSize: 11 }} />
            <YAxis tick={{ fill: CHART.tick, fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={TOOLTIP_STYLE}
              formatter={(v: number) => [fmtBRL(v), 'Acumulado']}
              labelFormatter={(l) => { const pt = fluxoAcum[l as number]; return pt ? `Mês ${l} — ${pt.fase}` : `Mês ${l}`; }} />
            <ReferenceLine y={0} stroke={CHART.tick} strokeDasharray="6 3" />
            <Area type="monotone" dataKey="valor" stroke={CHART.gold} fill="url(#goldGrad)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Fluxo de Caixa Mensal */}
      <CollapsibleSection title={`Fluxo de Caixa Mensal — Cenário ${cenarioSel}`} icon={<TrendingUp size={16} className="text-primary" />}>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-muted-foreground border-b border-border/50 text-[10px] uppercase tracking-wider">
                <th className="py-2 text-left font-medium">Mês</th>
                <th className="py-2 text-left font-medium">Fase</th>
                <th className="py-2 text-right font-medium">Custo Equity</th>
                <th className="py-2 text-right font-medium">Liberação</th>
                <th className="py-2 text-right font-medium">Juros</th>
                <th className="py-2 text-right font-medium">PMT Pós</th>
                <th className="py-2 text-right font-medium">Venda/Quit.</th>
                <th className="py-2 text-right font-medium">Fluxo Líq.</th>
                <th className="py-2 text-right font-medium">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {c.fluxoDetalhado.map((row, i) => (
                <tr key={i} className={`border-b border-border/15 ${faseColor(row.fase)} transition-colors hover:bg-muted/15`}>
                  <td className="py-1.5 font-semibold">{row.mes}</td>
                  <td className="py-1.5">{row.fase}</td>
                  <td className="py-1.5 text-right">{row.custoEquity !== 0 ? fmtBRL(row.custoEquity) : '—'}</td>
                  <td className="py-1.5 text-right">{row.liberacaoBanco > 0 ? fmtBRL(row.liberacaoBanco) : '—'}</td>
                  <td className="py-1.5 text-right">{row.juros !== 0 ? fmtBRL(row.juros) : '—'}</td>
                  <td className="py-1.5 text-right">{row.pmtPos !== 0 ? fmtBRL(row.pmtPos) : '—'}</td>
                  <td className="py-1.5 text-right">{row.vendaIRQuit !== 0 ? fmtBRL(row.vendaIRQuit) : '—'}</td>
                  <td className={`py-1.5 text-right font-semibold ${row.fluxoLiquido >= 0 ? 'text-success' : 'text-destructive'}`}>{fmtBRL(row.fluxoLiquido)}</td>
                  <td className={`py-1.5 text-right ${row.acumulado >= 0 ? 'text-success' : 'text-destructive'}`}>{fmtBRL(row.acumulado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* Cronograma Juros de Obra */}
      <CollapsibleSection title="Cronograma de Juros de Obra">
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-muted-foreground border-b border-border/50 text-[10px] uppercase tracking-wider">
                <th className="py-2 text-left font-medium">Mês</th>
                <th className="py-2 text-right font-medium">Liberação</th>
                <th className="py-2 text-right font-medium">Saldo Devedor</th>
                <th className="py-2 text-right font-medium">Juros do Período</th>
              </tr>
            </thead>
            <tbody>
              {cronogramaJuros.map((row) => (
                <tr key={row.mes} className="border-b border-border/15 hover:bg-muted/10 transition-colors">
                  <td className="py-1.5 font-semibold">{row.mes}</td>
                  <td className="py-1.5 text-right">{fmtBRL(row.liberacao)}</td>
                  <td className="py-1.5 text-right">{fmtBRL(row.saldo)}</td>
                  <td className="py-1.5 text-right">{fmtBRL(row.juros)}</td>
                </tr>
              ))}
              <tr className="border-t border-border/50 font-bold">
                <td className="py-2">Total</td>
                <td className="py-2 text-right">{fmtBRL(resultado.valorFinanciado)}</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right text-primary">{fmtBRL(totalJurosObra)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* Composição de Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="section-card p-5">
          <h2 className="font-display text-lg mb-4">Composição de Custos</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} dataKey="value" paddingAngle={2} strokeWidth={0}>
                {donutData.map((_, i) => <Cell key={i} fill={donutColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmtBRL(v)]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="section-card p-5 overflow-x-auto">
          <h2 className="font-display text-lg mb-4">Detalhamento</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border/50 text-muted-foreground text-xs"><th className="text-left py-2.5 font-medium">Categoria</th><th className="text-right py-2.5 font-medium">Valor</th><th className="text-right py-2.5 font-medium">%</th></tr></thead>
            <tbody className="font-mono text-[13px]">
              {donutData.map((d, i) => {
                const total = donutData.reduce((s, v) => s + v.value, 0);
                return (
                  <tr key={i} className="border-b border-border/15 hover:bg-muted/10 transition-colors">
                    <td className="py-2.5 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: donutColors[i] }} />
                      <span className="font-body text-xs">{d.name}</span>
                    </td>
                    <td className="text-right">{fmtBRL(d.value)}</td>
                    <td className="text-right text-muted-foreground">{((d.value / total) * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análise de Mercado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="section-card p-5">
          <h2 className="font-display text-lg mb-4">Comparáveis (R$/m²)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
              <XAxis type="number" tick={{ fill: CHART.tick, fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: CHART.tick, fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} /m²`]} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {compData.map((_, i) => <Cell key={i} fill={i === compData.length - 1 ? CHART.gold : CHART.blue} />)}
              </Bar>
              <ReferenceLine x={mercado.medianaComps} stroke={CHART.yellow} strokeDasharray="4 4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="section-card p-5 space-y-4">
          <h2 className="font-display text-lg">Indicadores de Mercado</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: 'Mediana R$/m²', v: fmtBRL(mercado.medianaComps) },
              { l: 'Média R$/m²', v: fmtBRL(mercado.mediaComps) },
              { l: 'Desvio vs modelo', v: fmtPct(mercado.desvioPreco) },
              { l: 'Buffer break-even', v: fmtPct(bufferBE) },
            ].map(x => (
              <div key={x.l} className="bg-muted/15 rounded-xl p-3.5 border border-border/20">
                <p className="text-[10px] text-muted-foreground font-medium mb-1">{x.l}</p>
                <p className="font-mono text-sm font-semibold">{x.v}</p>
              </div>
            ))}
          </div>
          <div className={`rounded-xl p-3.5 text-sm font-medium border ${mercado.desvioPreco <= 0.05 ? 'bg-success/8 text-success border-success/15' : mercado.desvioPreco <= 0.15 ? 'bg-warning/8 text-warning border-warning/15' : 'bg-destructive/8 text-destructive border-destructive/15'}`}>
            {mercado.alertaMercado}
          </div>
        </div>
      </div>

      {/* Sensibilidade */}
      <div className="space-y-4">
        <h2 className="font-display text-lg">Análise de Sensibilidade</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="section-card p-4 overflow-x-auto">
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">ROE × (ΔCusto \ ΔVGV)</p>
            <table className="w-full text-[11px]">
              <thead><tr className="text-muted-foreground"><th className="py-1.5 text-left text-[10px]">ΔCusto\ΔVGV</th>{deltas.map(d => <th key={d} className="py-1.5 text-center text-[10px]">{d >= 0 ? '+' : ''}{(d * 100).toFixed(0)}%</th>)}</tr></thead>
              <tbody className="font-mono">{sensROE.map((row, i) => (
                <tr key={i}><td className="py-1.5 text-muted-foreground text-[10px]">{row.deltaCusto as string}</td>
                  {deltas.map(d => { const v = row[`${(d * 100).toFixed(0)}%`] as number; return <td key={d} className={`py-1.5 text-center rounded-md ${cellColor(v, [0.6, 0.3])}`}>{(v * 100).toFixed(1)}%</td>; })}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="section-card p-4 overflow-x-auto">
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Margem × (ΔVGV vs Meses Pós)</p>
            <table className="w-full text-[11px]">
              <thead><tr className="text-muted-foreground"><th className="py-1.5 text-left text-[10px]">ΔVGV\Meses</th>{mesesOptions.map(m => <th key={m} className="py-1.5 text-center text-[10px]">{m}m</th>)}</tr></thead>
              <tbody className="font-mono">{sensMargem.map((row, i) => (
                <tr key={i}><td className="py-1.5 text-muted-foreground text-[10px]">{row.deltaVGV as string}</td>
                  {mesesOptions.map(m => { const v = row[`${m}m`] as number; return <td key={m} className={`py-1.5 text-center rounded-md ${cellColor(v, [0.2, 0.1])}`}>{(v * 100).toFixed(1)}%</td>; })}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="section-card p-4 overflow-x-auto">
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Exposição × (ΔTaxa vs LTV)</p>
            <table className="w-full text-[11px]">
              <thead><tr className="text-muted-foreground"><th className="py-1.5 text-left text-[10px]">ΔTaxa\LTV</th>{ltvOptions.map(l => <th key={l} className="py-1.5 text-center text-[10px]">{(l * 100).toFixed(0)}%</th>)}</tr></thead>
              <tbody className="font-mono">{sensExposicao.map((row, i) => (
                <tr key={i}><td className="py-1.5 text-muted-foreground text-[10px]">{row.deltaTaxa as string}</td>
                  {ltvOptions.map(l => { const v = row[`${(l * 100).toFixed(0)}%`] as number; return <td key={l} className={`py-1.5 text-center rounded-md ${cellColorExp(v)}`}>{(v / 1000).toFixed(0)}k</td>; })}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Auditoria */}
      <div className="section-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Shield size={18} className="text-primary" />
            <h2 className="font-display text-lg">Auditoria do Modelo</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 border border-border/30">
            <span className="text-xs font-mono text-muted-foreground">{checksOK}/{auditChecks.length} OK</span>
            <div className="w-12 h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(checksOK / auditChecks.length) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {auditChecks.map((check, i) => (
            <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
              check.status === 'ok' ? 'bg-success/5 border-success/10' 
              : check.status === 'warn' ? 'bg-warning/5 border-warning/10' 
              : 'bg-destructive/5 border-destructive/10'
            }`}>
              <span className="text-sm mt-0.5">{check.status === 'ok' ? '✅' : check.status === 'warn' ? '⚠️' : '❌'}</span>
              <div>
                <p className="text-xs font-medium">{check.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
