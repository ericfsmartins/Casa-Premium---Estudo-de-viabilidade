import { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Shield, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { RiscoItem, RiscoCategoria, RiscoImpacto, RiscoStatus, IMPACTO_NUM, ProjetoInputs } from '@/lib/types';
import { v4Fallback } from '@/lib/utils-id';

interface RiscosPageProps {
  projeto: ProjetoInputs;
  onAddRisco: (r: Omit<RiscoItem, 'id' | 'score'>) => void;
  onUpdateRisco: (r: RiscoItem) => void;
  onRemoveRisco: (id: string) => void;
  onBack: () => void;
}

const CATEGORIAS: RiscoCategoria[] = ['Mercado/Vendas', 'Construção', 'Financeiro', 'Jurídico', 'Ambiental', 'Prazo'];
const IMPACTOS: RiscoImpacto[] = ['Baixo', 'Médio', 'Alto', 'Crítico'];
const STATUS_LIST: RiscoStatus[] = ['Aberto', 'Mitigado', 'Aceito'];

const IMPACTO_COLOR: Record<RiscoImpacto, string> = {
  Baixo: 'bg-success/10 text-success border-success/20',
  Médio: 'bg-warning/10 text-warning border-warning/20',
  Alto: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Crítico: 'bg-destructive/10 text-destructive border-destructive/20',
};

const STATUS_COLOR: Record<RiscoStatus, string> = {
  Aberto: 'bg-destructive/10 text-destructive',
  Mitigado: 'bg-success/10 text-success',
  Aceito: 'bg-muted/30 text-muted-foreground',
};

const CAT_ICON: Record<string, string> = {
  'Mercado/Vendas': '📊',
  'Construção': '🏗️',
  'Financeiro': '💰',
  'Jurídico': '⚖️',
  'Ambiental': '🌿',
  'Prazo': '⏰',
};

const emptyRisco = (): Omit<RiscoItem, 'id' | 'score'> => ({
  categoria: 'Mercado/Vendas',
  descricao: '',
  probabilidade: 0.1,
  impacto: 'Médio',
  mitigacao: '',
  responsavel: '',
  status: 'Aberto',
});

function RiscoModal({ initial, onSave, onClose }: {
  initial: Omit<RiscoItem, 'id' | 'score'> | RiscoItem;
  onSave: (r: Omit<RiscoItem, 'id' | 'score'> | RiscoItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...initial });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl p-6 space-y-5 animate-scale">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">{'id' in form ? 'Editar Risco' : 'Novo Risco'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Categoria</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIAS.map(c => (
                <button key={c} onClick={() => set('categoria', c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    form.categoria === c ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/30 bg-muted/20 text-muted-foreground hover:border-border/50'
                  }`}>
                  {CAT_ICON[c]} {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Descrição</label>
            <textarea rows={2} value={form.descricao} onChange={e => set('descricao', e.target.value)}
              className="input-premium w-full resize-none" placeholder="Descreva o risco..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
                Probabilidade: <span className="text-primary font-mono">{(form.probabilidade * 100).toFixed(0)}%</span>
              </label>
              <input type="range" min="0.01" max="1" step="0.01" value={form.probabilidade}
                onChange={e => set('probabilidade', parseFloat(e.target.value))}
                className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Impacto</label>
              <div className="grid grid-cols-2 gap-1.5">
                {IMPACTOS.map(imp => (
                  <button key={imp} onClick={() => set('impacto', imp)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                      form.impacto === imp ? IMPACTO_COLOR[imp] : 'border-border/30 bg-muted/20 text-muted-foreground'
                    }`}>
                    {imp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Mitigação</label>
            <textarea rows={2} value={form.mitigacao} onChange={e => set('mitigacao', e.target.value)}
              className="input-premium w-full resize-none" placeholder="Plano de mitigação..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Responsável</label>
              <input value={form.responsavel} onChange={e => set('responsavel', e.target.value)} className="input-premium w-full" placeholder="Nome..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Status</label>
              <div className="flex flex-col gap-1">
                {STATUS_LIST.map(s => (
                  <button key={s} onClick={() => set('status', s)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all text-left ${
                      form.status === s ? STATUS_COLOR[s] + ' border-current/30' : 'border-border/30 bg-muted/20 text-muted-foreground'
                    }`}>
                    {s === 'Aberto' ? '🔴' : s === 'Mitigado' ? '✅' : '🟡'} {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancelar</button>
            <button
              onClick={() => { if (form.descricao.trim()) { onSave(form); onClose(); } }}
              className="btn-primary flex-1 justify-center"
              disabled={!form.descricao.trim()}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RiscosPage({ projeto, onAddRisco, onUpdateRisco, onRemoveRisco, onBack }: RiscosPageProps) {
  const riscos = projeto.riscos || [];
  const [modal, setModal] = useState<null | 'new' | RiscoItem>(null);
  const [filtro, setFiltro] = useState<string>('all');

  const riscosAtivos = riscos.filter(r => r.status === 'Aberto');
  const riskScoreTotal = riscosAtivos.length > 0
    ? riscosAtivos.reduce((acc, r) => acc + r.score, 0) / riscosAtivos.length
    : 0;

  const scoreCor = riskScoreTotal <= 2 ? 'text-success' : riskScoreTotal <= 5 ? 'text-warning' : 'text-destructive';
  const scoreLabel = riskScoreTotal <= 2 ? 'Baixo' : riskScoreTotal <= 5 ? 'Médio' : 'Alto';

  const riscosFiltrados = filtro === 'all' ? riscos : riscos.filter(r => r.categoria === filtro || r.status === filtro);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fade">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent hover:border-border/40 transition-all active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-0.5">Módulo</p>
            <h1 className="font-display text-2xl text-foreground tracking-tight flex items-center gap-2">
              <Shield size={20} className="text-primary" /> Gestão de Riscos
            </h1>
            <p className="text-[11px] text-muted-foreground">{projeto.nome}</p>
          </div>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">
          <Plus size={16} /> Novo Risco
        </button>
      </div>

      {/* Risk Score Total */}
      <div className={`section-card p-5 flex items-center justify-between ${
        riskScoreTotal <= 2 ? 'border-success/30 bg-success/3' : riskScoreTotal <= 5 ? 'border-warning/30' : 'border-destructive/30'
      }`}>
        <div className="flex items-center gap-3">
          <Shield size={24} className={scoreCor} />
          <div>
            <p className="text-sm font-semibold">Risk Score Total</p>
            <p className="text-[11px] text-muted-foreground">{riscosAtivos.length} riscos ativos</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-display text-3xl font-bold ${scoreCor}`}>{riskScoreTotal.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">{scoreLabel}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['all', ...CATEGORIAS, ...STATUS_LIST].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              filtro === f ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/30 bg-muted/20 text-muted-foreground hover:border-border/50'
            }`}>
            {f === 'all' ? '👁 Todos' : f}
          </button>
        ))}
      </div>

      {/* Lista de Riscos */}
      <div className="section-card">
        <div className="px-5 py-4 border-b border-border/30">
          <h2 className="font-display text-base">Riscos Identificados</h2>
        </div>
        {riscosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <Shield size={32} className="opacity-30" />
            <p className="text-sm">Nenhum risco encontrado</p>
            <button onClick={() => setModal('new')} className="btn-ghost text-xs">
              <Plus size={13} /> Adicionar primeiro risco
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {riscosFiltrados.map(r => (
              <div key={r.id} className="px-5 py-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${IMPACTO_COLOR[r.impacto]}`}>{r.impacto}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full border border-border/30">{CAT_ICON[r.categoria]} {r.categoria}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLOR[r.status]}`}>
                        {r.status === 'Aberto' ? '🔴' : r.status === 'Mitigado' ? '✅' : '🟡'} {r.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{r.descricao}</p>
                    {r.mitigacao && <p className="text-[11px] text-muted-foreground"><span className="font-semibold">Mitigação:</span> {r.mitigacao}</p>}
                    <div className="flex gap-4 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">Prob {(r.probabilidade * 100).toFixed(0)}%</span>
                      {r.responsavel && <span className="text-[10px] text-muted-foreground">Resp. {r.responsavel}</span>}
                      <span className="text-[10px] font-mono text-primary">Score {r.score.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setModal(r)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onRemoveRisco(r.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <RiscoModal
          initial={modal === 'new' ? emptyRisco() : modal}
          onSave={data => {
            if (modal === 'new') {
              onAddRisco(data as Omit<RiscoItem, 'id' | 'score'>);
            } else {
              onUpdateRisco(data as RiscoItem);
            }
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
