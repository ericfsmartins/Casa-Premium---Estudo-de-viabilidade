import { ProjetoCompleto } from '@/lib/types';
import { fmtBRL, fmtPct } from '@/lib/formatters';
import { Trash2, Eye, Edit, Plus, Trophy } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#C9A84C', '#60A5FA', '#34D399', '#F87171'];

interface ComparativoProps {
  resultados: ProjetoCompleto[];
  onSetActive: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (nome: string) => void;
  onClearAll: () => void;
}

export default function ComparativoPage({ resultados, onSetActive, onRemove, onAdd, onClearAll }: ComparativoProps) {
  const navigate = useNavigate();
  const sorted = [...resultados].sort((a, b) => b.parecer.score - a.parecer.score);

  const radarData = (() => {
    const top4 = sorted.slice(0, 4);
    const axes = ['ROE', 'Margem', 'TIR', 'Score', 'Buffer BE'];
    return axes.map(axis => {
      const point: Record<string, string | number> = { subject: axis };
      top4.forEach((r, i) => {
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-foreground">Comparativo de Projetos</h1>
        <div className="flex gap-2">
          <button onClick={() => { const nome = prompt('Nome do novo projeto:'); if (nome) { onAdd(nome); navigate('/novo'); } }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-95">
            <Plus size={14} /> Novo Projeto
          </button>
          <button onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors active:scale-95">
            Limpar todos
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-muted-foreground text-xs">
            <th className="text-left p-3">#</th><th className="text-left p-3">Nome</th>
            <th className="text-right p-3">TIR</th><th className="text-right p-3">Margem</th>
            <th className="text-right p-3">Lucro</th><th className="text-right p-3">Score</th>
            <th className="text-center p-3">Status</th><th className="text-right p-3">Ações</th>
          </tr></thead>
          <tbody>
            {sorted.map((r, i) => {
              const c = r.cenarios.B;
              const scoreColor = r.parecer.score >= 75 ? 'bg-success' : r.parecer.score >= 55 ? 'bg-warning' : r.parecer.score >= 35 ? 'bg-warning' : 'bg-destructive';
              return (
                <tr key={r.inputs.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-mono">{i + 1}</td>
                  <td className="p-3 font-medium flex items-center gap-2">
                    {r.inputs.nome}
                    {i === 0 && <span className="flex items-center gap-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded"><Trophy size={10} /> Iniciar primeiro</span>}
                  </td>
                  <td className="p-3 text-right font-mono">{fmtPct(c.tir)}</td>
                  <td className="p-3 text-right font-mono">{fmtPct(c.margem)}</td>
                  <td className="p-3 text-right font-mono">{fmtBRL(c.lucroLiquido)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreColor}`} style={{ width: `${r.parecer.score}%` }} />
                      </div>
                      <span className="font-mono text-xs">{r.parecer.score}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${r.parecer.score >= 55 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {r.parecer.score >= 75 ? 'Excelente' : r.parecer.score >= 55 ? 'Viável' : r.parecer.score >= 35 ? 'Risco' : 'Inviável'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { onSetActive(r.inputs.id); navigate(`/projeto/${r.inputs.id}`); }} className="p-1.5 text-muted-foreground hover:text-info transition-colors" title="Ver dashboard"><Eye size={14} /></button>
                      <button onClick={() => { onSetActive(r.inputs.id); navigate(`/projeto/${r.inputs.id}`); }} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Editar"><Edit size={14} /></button>
                      <button onClick={() => onRemove(r.inputs.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Excluir"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length >= 2 && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-display text-lg mb-3">Radar Comparativo (até 4 projetos)</h2>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(225,25%,20%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892A8', fontSize: 11 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              {sorted.slice(0, 4).map((r, i) => (
                <Radar key={r.inputs.id} name={r.inputs.nome} dataKey={r.inputs.nome}
                  stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
