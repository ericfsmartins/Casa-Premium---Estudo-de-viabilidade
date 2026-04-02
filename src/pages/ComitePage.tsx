import { useState } from 'react';
import { ArrowLeft, Download, Gavel, AlertTriangle, CheckCircle2, FileText, Shield } from 'lucide-react';
import { ProjetoCompleto, DecisaoTipo, DecisaoComite, ProjetoInputs, IMPACTO_NUM } from '@/lib/types';
import { fmtBRL, fmtPct } from '@/lib/formatters';

interface ComitePageProps {
  projeto: ProjetoInputs;
  resultado: ProjetoCompleto;
  onAddDecisao: (d: Omit<DecisaoComite, 'id' | 'dataDecisao'>) => void;
  onBack: () => void;
}

const DECISOES: { tipo: DecisaoTipo; label: string; icon: string; color: string }[] = [
  { tipo: 'comprar',    label: 'COMPRAR TERRENO', icon: '🏠', color: 'border-success/50 bg-success/10 text-success hover:bg-success/20' },
  { tipo: 'renegociar', label: 'RENEGOCIAR',      icon: '🔄', color: 'border-warning/50 bg-warning/10 text-warning hover:bg-warning/20' },
  { tipo: 'ajustar',   label: 'AJUSTAR PRODUTO', icon: '📐', color: 'border-info/50 bg-info/10 text-info hover:bg-info/20' },
  { tipo: 'reprovar',  label: 'REPROVAR',         icon: '❌', color: 'border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20' },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

export default function ComitePage({ projeto, resultado, onAddDecisao, onBack }: ComitePageProps) {
  const [justificativa, setJustificativa] = useState('');
  const [decisorNome, setDecisorNome] = useState('');
  const [decisaoSelecionada, setDecisaoSelecionada] = useState<DecisaoTipo | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const riscos = projeto.riscos || [];
  const fases = projeto.checklist || [];
  const decisoes = projeto.decisoes || [];

  const riscosCriticos = riscos.filter(r => r.status === 'Aberto' && (r.impacto === 'Crítico' || r.impacto === 'Alto'));
  const riskScoreTotal = riscos.filter(r => r.status === 'Aberto').length > 0
    ? riscos.filter(r => r.status === 'Aberto').reduce((acc, r) => acc + r.score, 0) / riscos.filter(r => r.status === 'Aberto').length
    : 0;

  const totalItens = fases.reduce((s, f) => s + f.itens.length, 0);
  const totalConcluidos = fases.reduce((s, f) => s + f.itens.filter(i => i.status === 'concluido').length, 0);
  const pctDocumental = totalItens > 0 ? Math.round((totalConcluidos / totalItens) * 100) : 0;
  const itensCriticos = fases.flatMap(f => f.itens.filter(i => i.status === 'critico'));

  const cenB = resultado.cenarios.B;
  const vgvEfetivo = Math.max(resultado.inputs.valorVenda, resultado.inputs.precoMercado * resultado.inputs.areaConstruida);
  const bufferBE = vgvEfetivo > 0 ? (vgvEfetivo - cenB.breakEvenVGV) / vgvEfetivo : 0;

  const alertas: string[] = [
    ...resultado.parecer.alertas,
    ...(bufferBE < 0.10 ? ['Buffer break-even crítico.'] : []),
    ...(resultado.mercado.desvioPreco > 0.15 ? ['Alerta de Eficiência. Verifique se o padrão construtivo está adequado ao mercado.'] : []),
    ...(riskScoreTotal > 5 ? ['Risk Score elevado — revisar mitigações.'] : []),
  ];

  const metaMet =
    cenB.roe >= resultado.inputs.tma &&
    cenB.margem >= 0.15 &&
    cenB.vpl > 0;

  const justMin = 20;
  const podeAprovar = metaMet && itensCriticos.length === 0 && justificativa.trim().length >= justMin && decisaoSelecionada === 'comprar';
  const podeDecisao = justificativa.trim().length >= justMin && decisaoSelecionada !== null;

  function handleDecisao() {
    if (!podeDecisao || !decisaoSelecionada) return;
    onAddDecisao({
      tipo: decisaoSelecionada,
      justificativa: justificativa.trim(),
      decisorNome: decisorNome.trim() || 'Comitê',
    });
    setConfirmando(true);
    setTimeout(() => setConfirmando(false), 3000);
    setJustificativa('');
    setDecisorNome('');
    setDecisaoSelecionada(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fade">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent hover:border-border/40 transition-all active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-0.5">Modo Comitê</p>
            <h1 className="font-display text-2xl text-foreground tracking-tight flex items-center gap-2">
              <Gavel size={20} className="text-primary" /> {projeto.nome}
            </h1>
          </div>
        </div>
        <button onClick={() => window.print()} className="btn-ghost text-xs flex items-center gap-1.5">
          <Download size={14} /> Exportar PDF
        </button>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Riscos Críticos */}
        <div className="section-card p-5 space-y-3">
          <h2 className="font-display text-base flex items-center gap-2">
            <Shield size={16} className="text-destructive" /> Riscos Críticos
          </h2>
          {riscosCriticos.length === 0 ? (
            <div className="flex items-center gap-2 py-2 text-success text-sm">
              <CheckCircle2 size={14} /> Nenhum risco crítico aberto
            </div>
          ) : (
            <div className="space-y-2">
              {riscosCriticos.map(r => (
                <div key={r.id} className="p-3 rounded-xl bg-destructive/5 border border-destructive/15">
                  <p className="text-sm text-destructive font-medium">{r.descricao}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.categoria}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Risk Score: {r.score.toFixed(1)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Situação Documental */}
        <div className="section-card p-5 space-y-4">
          <h2 className="font-display text-base flex items-center gap-2">
            <FileText size={16} className="text-primary" /> Situação Documental
          </h2>
          <div className="flex flex-col items-center gap-3">
            <span className={`font-display text-5xl font-bold ${pctDocumental >= 80 ? 'text-success' : pctDocumental >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {pctDocumental}%
            </span>
            <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${pctDocumental === 100 ? 'bg-success' : 'bg-primary'}`}
                style={{ width: `${pctDocumental}%` }}
              />
            </div>
            {itensCriticos.length > 0 && (
              <div className="w-full space-y-1">
                <p className="text-[10px] font-semibold text-destructive">{itensCriticos.length} pendência(s) crítica(s)</p>
                {itensCriticos.map(it => (
                  <p key={it.id} className="text-[10px] text-destructive/70">• {it.texto}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: 'ROE', v: fmtPct(cenB.roe), ok: cenB.roe >= resultado.inputs.tma },
          { l: 'Margem Líquida', v: fmtPct(cenB.margem), ok: cenB.margem >= 0.15 },
          { l: 'VPL Equity', v: fmtBRL(cenB.vpl), ok: cenB.vpl > 0 },
          { l: 'Risk Score', v: riskScoreTotal.toFixed(1), ok: riskScoreTotal <= 3 },
        ].map(kpi => (
          <div key={kpi.l} className={`rounded-xl p-4 border ${kpi.ok ? 'border-success/20 bg-success/5' : 'border-destructive/20 bg-destructive/5'}`}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{kpi.l}</p>
            <p className={`font-display text-xl font-bold ${kpi.ok ? 'text-success' : 'text-destructive'}`}>{kpi.v}</p>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="section-card p-5 space-y-2">
          <h2 className="font-display text-base flex items-center gap-2 text-warning">
            <AlertTriangle size={16} /> Alertas Importantes
          </h2>
          {alertas.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-warning/80">
              <span className="shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: a.replace(/([A-Za-záàãâéêíóôõúçÇÃÂÉÊÍÓÔÕÚ ]+\.)/, '<strong>$1</strong>') }} />
            </div>
          ))}
        </div>
      )}

      {/* Decisão */}
      <div className="section-card p-6 space-y-5">
        <h2 className="font-display text-base">Justificativa da Decisão</h2>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Decisor</label>
          <input value={decisorNome} onChange={e => setDecisorNome(e.target.value)}
            className="input-premium w-full sm:w-64" placeholder="Nome do responsável pela decisão..." />
        </div>

        <div>
          <textarea
            value={justificativa}
            onChange={e => setJustificativa(e.target.value)}
            rows={4}
            className="input-premium w-full resize-none"
            placeholder={`Descreva a justificativa para a decisão tomada... (mín. ${justMin} caracteres para aprovação com ressalva)`}
          />
          <p className={`text-[10px] mt-1 ${justificativa.length >= justMin ? 'text-success' : 'text-muted-foreground/60'}`}>
            {justificativa.length}/{justMin} caracteres mínimos
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {DECISOES.map(d => (
            <button
              key={d.tipo}
              onClick={() => setDecisaoSelecionada(d.tipo)}
              disabled={d.tipo === 'comprar' && !metaMet}
              className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border font-bold text-xs transition-all duration-200 ${
                decisaoSelecionada === d.tipo
                  ? d.color + ' scale-[1.02] shadow-md'
                  : 'border-border/30 bg-muted/20 text-muted-foreground hover:border-border/60 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>

        <div>
          <button
            onClick={handleDecisao}
            disabled={!podeDecisao}
            className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {confirmando ? '✅ Decisão registrada!' : '📋 Registrar Decisão'}
          </button>
          {!podeDecisao && (
            <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
              ⚠️ Para aprovar: atingir todas as metas, preencher justificativa e selecionar uma decisão
            </p>
          )}
        </div>
      </div>

      {/* Histórico de Decisões */}
      {decisoes.length > 0 && (
        <div className="section-card p-5">
          <h2 className="font-display text-base mb-4">Histórico de Decisões</h2>
          <div className="space-y-3">
            {[...decisoes].reverse().map(d => {
              const dec = DECISOES.find(x => x.tipo === d.tipo);
              return (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/15 border border-border/20">
                  <span className="text-xl shrink-0">{dec?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-bold">{dec?.label}</p>
                      <span className="text-[10px] text-muted-foreground font-mono">{formatDate(d.dataDecisao)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{d.decisorNome}</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-1 italic">"{d.justificativa}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
