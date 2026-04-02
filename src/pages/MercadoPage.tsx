import { ArrowLeft, TrendingUp, TrendingDown, Minus, Users, BarChart3, Activity } from 'lucide-react';
import { ProjetoCompleto, ProjetoInputs } from '@/lib/types';
import { fmtBRL, fmtPct } from '@/lib/formatters';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface MercadoPageProps {
  projeto: ProjetoInputs;
  resultado: ProjetoCompleto;
  onUpdateTendencia: (t: 'subindo' | 'estavel' | 'caindo') => void;
  onUpdatePerfil: (p: 'familia' | 'investidor' | 'permutante' | 'misto') => void;
  onBack: () => void;
}

const CHART = {
  gold: 'hsl(43, 52%, 54%)',
  blue: 'hsl(217, 92%, 68%)',
  green: 'hsl(160, 64%, 52%)',
  red: 'hsl(0, 72%, 71%)',
  grid: 'hsl(222, 18%, 18%)',
  tick: 'hsl(222, 12%, 50%)',
};

const TOOLTIP_STYLE = {
  background: 'hsl(222, 25%, 11%)',
  border: '1px solid hsl(222, 18%, 22%)',
  borderRadius: 10,
  fontSize: 12,
};

const TENDENCIAS = [
  { value: 'subindo' as const, label: 'Subindo', icon: <TrendingUp size={14} />, color: 'text-success border-success/40 bg-success/8' },
  { value: 'estavel' as const, label: 'Estável', icon: <Minus size={14} />, color: 'text-warning border-warning/40 bg-warning/8' },
  { value: 'caindo' as const, label: 'Caindo', icon: <TrendingDown size={14} />, color: 'text-destructive border-destructive/40 bg-destructive/8' },
];

const PERFIS = [
  { value: 'familia' as const, label: 'Família', icon: '👨‍👩‍👧' },
  { value: 'investidor' as const, label: 'Investidor', icon: '📈' },
  { value: 'permutante' as const, label: 'Permutante', icon: '🔄' },
  { value: 'misto' as const, label: 'Misto', icon: '🎯' },
];

export default function MercadoPage({ projeto, resultado, onUpdateTendencia, onUpdatePerfil, onBack }: MercadoPageProps) {
  const { mercado, inputs } = resultado;
  const vgvEfetivo = Math.max(inputs.valorVenda, inputs.precoMercado * inputs.areaConstruida);
  const modeloPorM2 = inputs.areaConstruida > 0 ? vgvEfetivo / inputs.areaConstruida : 0;

  const comps = inputs.comparaveis.filter(c => c.area > 0);
  const compData = [
    ...comps.map(c => ({ name: c.descricao.slice(0, 22), value: c.preco / c.area, isModel: false })),
    { name: inputs.nome.slice(0, 22), value: modeloPorM2, isModel: true },
  ];

  const scoreL = mercado.scoreLiquidez;
  const scoreCor = scoreL >= 70 ? 'text-success' : scoreL >= 45 ? 'text-warning' : 'text-destructive';

  const tendencia = projeto.mercadoTendencia || 'estavel';
  const perfil = projeto.mercadoPerfil || 'familia';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade">
        <button onClick={onBack} className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent hover:border-border/40 transition-all active:scale-95">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-0.5">Módulo</p>
          <h1 className="font-display text-2xl text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" /> Estudo de Mercado
          </h1>
          <p className="text-[11px] text-muted-foreground">{projeto.nome}</p>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Mediana R$/m²', value: fmtBRL(mercado.medianaComps), sub: 'Referência principal' },
          { label: 'Média R$/m²', value: fmtBRL(mercado.mediaComps), sub: 'Média simples' },
          { label: 'Desvio Padrão', value: fmtBRL(mercado.desvioPadrao), sub: 'Dispersão de preços' },
          { label: 'Seu preço/m²', value: fmtBRL(modeloPorM2), sub: mercado.desvioPreco >= 0 ? `+${(mercado.desvioPreco * 100).toFixed(1)}% acima` : `${(mercado.desvioPreco * 100).toFixed(1)}% abaixo` },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{kpi.label}</p>
            <p className="font-display text-lg font-bold text-foreground">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Score de Liquidez + alerta de mercado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="section-card p-5">
          <h2 className="font-display text-base mb-4 flex items-center gap-2">
            <Activity size={15} className="text-primary" /> Score de Liquidez
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <svg width="110" height="110" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(222,18%,15%)" strokeWidth="5" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={scoreL >= 70 ? CHART.green : scoreL >= 45 ? 'hsl(43,96%,56%)' : CHART.red}
                  strokeWidth="5" strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - scoreL / 100)}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }} />
                <text x="50" y="46" textAnchor="middle" fontSize="22" fontWeight="700"
                  fill={scoreL >= 70 ? CHART.green : scoreL >= 45 ? 'hsl(43,96%,56%)' : CHART.red}>{scoreL}</text>
                <text x="50" y="60" textAnchor="middle" fontSize="9" fill="hsl(222,12%,45%)">/ 100</text>
              </svg>
            </div>
            <div className="space-y-2">
              <p className={`text-sm font-semibold ${scoreCor}`}>{mercado.alertaLiquidez}</p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                mercado.desvioPreco <= 0.05 ? 'border-success/30 bg-success/8 text-success' : mercado.desvioPreco <= 0.15 ? 'border-warning/30 bg-warning/8 text-warning' : 'border-destructive/30 bg-destructive/8 text-destructive'
              }`}>
                {mercado.alertaMercado}
              </div>
              <p className="text-[11px] text-muted-foreground">Range: {fmtBRL(mercado.minComp)} – {fmtBRL(mercado.maxComp)}/m²</p>
            </div>
          </div>
        </div>

        {/* Tendência e Perfil */}
        <div className="section-card p-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Tendência de Preços</p>
            <div className="flex gap-2 flex-wrap">
              {TENDENCIAS.map(t => (
                <button key={t.value} onClick={() => onUpdateTendencia(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    tendencia === t.value ? t.color : 'border-border/30 bg-muted/20 text-muted-foreground hover:border-border/50'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5"><Users size={11} /> Perfil do Comprador</p>
            <div className="flex gap-2 flex-wrap">
              {PERFIS.map(p => (
                <button key={p.value} onClick={() => onUpdatePerfil(p.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    perfil === p.value ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/30 bg-muted/20 text-muted-foreground hover:border-border/50'
                  }`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Comparáveis */}
      <div className="section-card p-5">
        <h2 className="font-display text-base mb-4">Posicionamento de Preço (R$/m²)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={compData} layout="vertical" barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
            <XAxis type="number" tick={{ fill: CHART.tick, fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fill: CHART.tick, fontSize: 10 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/m²`]} />
            <ReferenceLine x={mercado.medianaComps} stroke={CHART.gold} strokeDasharray="4 4" label={{ value: 'Mediana', fill: CHART.gold, fontSize: 10 }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {compData.map((entry, i) => (
                <Cell key={i} fill={entry.isModel ? CHART.gold : CHART.blue} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de comparáveis */}
      <div className="section-card p-5 overflow-x-auto">
        <h2 className="font-display text-base mb-4">Tabela de Comparáveis</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground text-[10px] uppercase tracking-wider">
              <th className="text-left py-2.5 font-medium">Descrição</th>
              <th className="text-right py-2.5 font-medium">Área (m²)</th>
              <th className="text-right py-2.5 font-medium">Preço</th>
              <th className="text-right py-2.5 font-medium">R$/m²</th>
              <th className="text-right py-2.5 font-medium">vs Mediana</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[12px]">
            {comps.map((c, i) => {
              const pm2 = c.area > 0 ? c.preco / c.area : 0;
              const vs = mercado.medianaComps > 0 ? (pm2 - mercado.medianaComps) / mercado.medianaComps : 0;
              return (
                <tr key={i} className="border-b border-border/15 hover:bg-muted/10 transition-colors">
                  <td className="py-2.5 font-body text-xs">{c.descricao}</td>
                  <td className="py-2.5 text-right">{c.area.toFixed(0)}</td>
                  <td className="py-2.5 text-right">{fmtBRL(c.preco)}</td>
                  <td className="py-2.5 text-right">{fmtBRL(pm2)}</td>
                  <td className={`py-2.5 text-right text-[11px] font-semibold ${vs > 0.05 ? 'text-warning' : vs < -0.05 ? 'text-success' : 'text-muted-foreground'}`}>
                    {vs >= 0 ? '+' : ''}{(vs * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
            <tr className="border-t border-border/50 bg-primary/5">
              <td className="py-2.5 font-semibold text-primary font-body text-xs">📌 {inputs.nome} (seu projeto)</td>
              <td className="py-2.5 text-right">{inputs.areaConstruida.toFixed(0)}</td>
              <td className="py-2.5 text-right text-primary font-bold">{fmtBRL(vgvEfetivo)}</td>
              <td className="py-2.5 text-right text-primary font-bold">{fmtBRL(modeloPorM2)}</td>
              <td className={`py-2.5 text-right font-bold ${mercado.desvioPreco > 0.05 ? 'text-warning' : mercado.desvioPreco < -0.05 ? 'text-success' : 'text-muted-foreground'}`}>
                {mercado.desvioPreco >= 0 ? '+' : ''}{(mercado.desvioPreco * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
