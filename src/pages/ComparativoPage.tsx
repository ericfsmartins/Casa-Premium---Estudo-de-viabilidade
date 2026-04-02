import { ProjetoCompleto } from '@/lib/types';
import { fmtBRL, fmtPct } from '@/lib/formatters';
import { Trash2, Eye, Edit, Plus, Trophy, ArrowUpRight } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const COLORS = ['hsl(43, 52%, 54%)', 'hsl(217, 92%, 68%)', 'hsl(160, 64%, 52%)', 'hsl(0, 72%, 71%)'];

interface ComparativoProps {
  resultados: ProjetoCompleto[];
  onSetActive: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (nome: string) => string | undefined;
  onClearAll: () => void;
}

export default function ComparativoPage({ resultados, onSetActive, onRemove, onAdd, onClearAll }: ComparativoProps) {
  const navigate = useNavigate();
  const [nomeNovo, setNomeNovo] = useState('');  
  const sorted = [...resultados].sort((a, b) => b.parecer.score - a.parecer.score);

  const handleAdd = () => {
    if (nomeNovo.trim()) {
      onAdd(nomeNovo.trim());
      setNomeNovo('');
    }
  };

  const radarData = (() => {
    const top4 = sorted.slice(0, 4);
    const axes = ['ROE', 'Margem', 'TIR', 'Score', 'Buffer BE'];
    return axes.map(axis => {
      const point: Record<string, string | number> = { subject: axis };
      top4.forEach((r) => {
        const c = r.cenarios.B;
        const vgv = Math.max(r.inputs.valorVenda, r.inputs.precoMercado * r.inputs.areaConstruida);
        const buf = vgv > 0 ? (vgv - c.breakEvenVGV) / vgv : 0;
        const vals: Record<string, number> = {
          'ROE': Math.min(100, c.roe * 100),
          'Margem': Math.min(100, c.margem * 400),
          'TIR': Math.min(100, c.tir * 200),
          'Score': r.parecer.score,
          'Buffer BE': Math.min(100, buf * 333),
        };
        point[r.inputs.nome] = vals[axis] || 0;
      });
      return point;
    });
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3 animate-fade">
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-2">Análise Comparativa</p>
          <h1 className="font-display text-3xl text-foreground tracking-tight">Comparativo de Projetos</h1>
        </div>
        <div className="flex gap-2">
        <div className="flex gap-2 items-center">
          <input value={nomeNovo} onChange={e => setNomeNovo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="input-premium text-xs !px-3 !py-2 w-48" placeholder="Nome do projeto..." />
          <button onClick={handleAdd} disabled={!nomeNovo.trim()}
            className="btn-primary text-xs !px-4 !py-2 disabled:opacity-40">
            <Plus size={14} /> Novo
          </button>
          <button onClick={onClearAll}
            className="btn-ghost text-xs text-destructive hover:text-destructive">
            Limpar todos
          </button>
        </div>
        </div>
      </div>

      <div className="section-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50 text-muted-foreground text-[10px] uppercase tracking-wider">
            <th className="text-left p-4 font-medium">#</th><th className="text-left p-4 font-medium">Nome</th>
            <th className="text-right p-4 font-medium">TIR</th><th className="text-right p-4 font-medium">Margem</th>
            <th className="text-right p-4 font-medium">Lucro</th><th className="text-right p-4 font-medium">Score</th>
            <th className="text-center p-4 font-medium">Status</th><th className="text-right p-4 font-medium">Ações</th>
          </tr></thead>
          <tbody>
            {sorted.map((r, i) => {
              const c = r.cenarios.B;
              const scoreColor = r.parecer.score >= 75 ? 'bg-success' : r.parecer.score >= 55 ? 'bg-warning' : r.parecer.score >= 35 ? 'bg-warning' : 'bg-destructive';
              return (
                <tr key={r.inputs.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-mono text-muted-foreground">{i + 1}</td>
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-2">
                      {r.inputs.nome}
                      {i === 0 && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg border border-primary/15"><Trophy size={10} /> Melhor</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-[13px]">{fmtPct(c.tir)}</td>
                  <td className="p-4 text-right font-mono text-[13px]">{fmtPct(c.margem)}</td>
                  <td className="p-4 text-right font-mono text-[13px]">{fmtBRL(c.lucroLiquido)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreColor} transition-all duration-700`} style={{ width: `${r.parecer.score}%` }} />
                      </div>
                      <span className="font-mono text-xs font-semibold">{r.parecer.score}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold border ${
                      r.parecer.score >= 75 ? 'bg-success/8 text-success border-success/15' 
                      : r.parecer.score >= 55 ? 'bg-warning/8 text-warning border-warning/15' 
                      : 'bg-destructive/8 text-destructive border-destructive/15'
                    }`}>
                      {r.parecer.score >= 75 ? 'Excelente' : r.parecer.score >= 55 ? 'Viável' : r.parecer.score >= 35 ? 'Risco' : 'Inviável'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { onSetActive(r.inputs.id); navigate(`/projeto/${r.inputs.id}`); }} 
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Ver dashboard">
                        <ArrowUpRight size={14} />
                      </button>
                      <button onClick={() => onRemove(r.inputs.id)} 
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length >= 2 && (
        <div className="section-card p-6">
          <h2 className="font-display text-lg mb-4">Radar Comparativo (até 4 projetos)</h2>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222,18%,18%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(222,12%,50%)', fontSize: 11 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              {sorted.slice(0, 4).map((r, i) => (
                <Radar key={r.inputs.id} name={r.inputs.nome} dataKey={r.inputs.nome}
                  stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
