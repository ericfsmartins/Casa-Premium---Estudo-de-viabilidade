import { ProjetoCompleto } from '@/lib/types';
import { fmtBRL, fmtPct } from '@/lib/formatters';
import { Plus, TrendingUp, BarChart3, Target, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  resultados: ProjetoCompleto[];
  onSetActive: (id: string) => void;
  onAdd: (nome: string) => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'bg-success/20 text-success border-success/30'
    : score >= 55 ? 'bg-warning/20 text-warning border-warning/30'
    : score >= 35 ? 'bg-warning/20 text-warning border-warning/30'
    : 'bg-destructive/20 text-destructive border-destructive/30';
  const label = score >= 75 ? 'Excelente' : score >= 55 ? 'Viável' : score >= 35 ? 'Risco' : 'Inviável';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${color}`}>
      {label} — {score}pts
    </span>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function HomePage({ resultados, onSetActive, onAdd }: HomePageProps) {
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    onSetActive(id);
    navigate(`/projeto/${id}`);
  };

  const handleAdd = () => {
    const nome = prompt('Nome do novo projeto:');
    if (nome) {
      onAdd(nome);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground tracking-tight">Meus Projetos</h1>
          <p className="text-sm text-muted-foreground mt-1">Clique em um projeto para ver o dashboard completo e editar os números</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity active:scale-95"
        >
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {resultados.map((r) => {
          const c = r.cenarios.B;
          const lucroPositivo = c.lucroLiquido > 0;

          return (
            <button
              key={r.inputs.id}
              onClick={() => handleClick(r.inputs.id)}
              className="group text-left bg-card border border-border rounded-xl p-6 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">{r.inputs.nome}</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Cenário B · {c.duracaoTotal} meses</p>
                </div>
                <ScoreBadge score={r.parecer.score} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <TrendingUp size={11} /> Lucro Líquido
                  </div>
                  <p className={`font-display text-xl font-bold ${lucroPositivo ? 'text-success' : 'text-destructive'}`}>
                    {fmtBRL(c.lucroLiquido)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <BarChart3 size={11} /> ROE
                  </div>
                  <p className={`font-display text-xl font-bold ${c.roe >= 0.6 ? 'text-success' : c.roe >= 0.3 ? 'text-warning' : 'text-destructive'}`}>
                    {fmtPct(c.roe)}
                  </p>
                  <MiniBar value={c.roe} max={1} color={c.roe >= 0.6 ? 'bg-success' : c.roe >= 0.3 ? 'bg-warning' : 'bg-destructive'} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <Target size={11} /> Margem Líquida
                  </div>
                  <p className={`font-display text-xl font-bold ${c.margem >= 0.20 ? 'text-success' : c.margem >= 0.15 ? 'text-warning' : 'text-destructive'}`}>
                    {fmtPct(c.margem)}
                  </p>
                  <MiniBar value={c.margem} max={0.30} color={c.margem >= 0.20 ? 'bg-success' : c.margem >= 0.15 ? 'bg-warning' : 'bg-destructive'} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <Award size={11} /> Score
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-display text-xl font-bold ${r.parecer.score >= 75 ? 'text-success' : r.parecer.score >= 55 ? 'text-warning' : 'text-destructive'}`}>
                      {r.parecer.score}
                    </p>
                    <span className="text-[10px] text-muted-foreground">/ 100</span>
                  </div>
                  <MiniBar value={r.parecer.score} max={100} color={r.parecer.score >= 75 ? 'bg-success' : r.parecer.score >= 55 ? 'bg-warning' : 'bg-destructive'} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-[11px] text-muted-foreground">
                  VGV: {fmtBRL(Math.max(r.inputs.valorVenda, r.inputs.precoMercado * r.inputs.areaConstruida))}
                </span>
                <span className="text-[11px] text-primary font-medium group-hover:underline">
                  Ver dashboard →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
