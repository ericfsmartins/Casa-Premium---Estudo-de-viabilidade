import { useState } from 'react';
import { ProjetoCompleto } from '@/lib/types';
import { fmtBRL, fmtPct } from '@/lib/formatters';
import { Plus, TrendingUp, BarChart3, Target, Award, ArrowUpRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  resultados: ProjetoCompleto[];
  onSetActive: (id: string) => void;
  onAdd: (nome: string) => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-success border-success/20 bg-success/8'
    : score >= 55 ? 'text-warning border-warning/20 bg-warning/8'
    : score >= 35 ? 'text-warning border-warning/20 bg-warning/8'
    : 'text-destructive border-destructive/20 bg-destructive/8';
  const label = score >= 75 ? 'Excelente' : score >= 55 ? 'Viável' : score >= 35 ? 'Risco' : 'Inviável';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${color}`}>
      {label} · {score}
    </span>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const animClasses = ['animate-in-1', 'animate-in-2', 'animate-in-3', 'animate-in-4', 'animate-in-5', 'animate-in-6'];

export default function HomePage({ resultados, onSetActive, onAdd }: HomePageProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState('');

  const handleClick = (id: string) => {
    onSetActive(id);
    navigate(`/projeto/${id}`);
  };

  const handleAdd = () => setShowModal(true);

  const confirmarAdd = () => {
    if (nomeProjeto.trim()) {
      onAdd(nomeProjeto.trim());
      setShowModal(false);
      setNomeProjeto('');
    }
  };

  return (
    <>
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 animate-fade">
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-2">Portfólio</p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">Meus Projetos</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Clique em um projeto para acessar o dashboard completo com análise financeira e editar os números.
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {resultados.map((r, idx) => {
          const c = r.cenarios.B;
          const lucroPositivo = c.lucroLiquido > 0;

          return (
            <button
              key={r.inputs.id}
              onClick={() => handleClick(r.inputs.id)}
              className={`group text-left glass-card gradient-border rounded-xl p-6 hover:-translate-y-1.5 transition-all duration-300 active:scale-[0.98] ${animClasses[idx] || 'animate-in-6'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-display text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                    {r.inputs.nome}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Cenário B · {c.duracaoTotal} meses
                  </p>
                </div>
                <ScoreBadge score={r.parecer.score} />
              </div>

              {/* KPIs Grid */}
              <div className="grid grid-cols-2 gap-x-5 gap-y-4 mb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    <TrendingUp size={11} /> Lucro Líquido
                  </div>
                  <p className={`font-display text-xl font-bold ${lucroPositivo ? 'text-success' : 'text-destructive'}`}>
                    {fmtBRL(c.lucroLiquido)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    <BarChart3 size={11} /> ROE
                  </div>
                  <p className={`font-display text-xl font-bold ${c.roe >= 0.6 ? 'text-success' : c.roe >= 0.3 ? 'text-warning' : 'text-destructive'}`}>
                    {fmtPct(c.roe)}
                  </p>
                  <MiniBar value={c.roe} max={1} color={c.roe >= 0.6 ? 'bg-success' : c.roe >= 0.3 ? 'bg-warning' : 'bg-destructive'} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    <Target size={11} /> Margem Líquida
                  </div>
                  <p className={`font-display text-xl font-bold ${c.margem >= 0.20 ? 'text-success' : c.margem >= 0.15 ? 'text-warning' : 'text-destructive'}`}>
                    {fmtPct(c.margem)}
                  </p>
                  <MiniBar value={c.margem} max={0.30} color={c.margem >= 0.20 ? 'bg-success' : c.margem >= 0.15 ? 'bg-warning' : 'bg-destructive'} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    <Award size={11} /> Score
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <p className={`font-display text-xl font-bold ${r.parecer.score >= 75 ? 'text-success' : r.parecer.score >= 55 ? 'text-warning' : 'text-destructive'}`}>
                      {r.parecer.score}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60">/ 100</span>
                  </div>
                  <MiniBar value={r.parecer.score} max={100} color={r.parecer.score >= 75 ? 'bg-success' : r.parecer.score >= 55 ? 'bg-warning' : 'bg-destructive'} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <span className="text-[11px] text-muted-foreground">
                  VGV: {fmtBRL(Math.max(r.inputs.valorVenda, r.inputs.precoMercado * r.inputs.areaConstruida))}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-primary font-medium group-hover:gap-2 transition-all duration-300">
                  Ver dashboard <ArrowUpRight size={12} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>

    {/* Modal Novo Projeto */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
        <div className="relative w-full max-w-sm bg-card border border-border/60 rounded-2xl shadow-2xl p-6 space-y-4 animate-scale">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Novo Projeto</h2>
            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground transition-colors"><X size={16} /></button>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Nome do projeto</label>
            <input
              autoFocus
              value={nomeProjeto}
              onChange={e => setNomeProjeto(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmarAdd()}
              className="input-premium w-full"
              placeholder="Ex: Casa Alpha — Jardim Europa"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Cancelar</button>
            <button onClick={confirmarAdd} disabled={!nomeProjeto.trim()} className="btn-primary flex-1 justify-center disabled:opacity-40">Criar</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
