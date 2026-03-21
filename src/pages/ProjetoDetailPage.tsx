import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjetoInputs, ProjetoCompleto } from '@/lib/types';
import { calcularProjetoCompleto } from '@/lib/calculos';
import DashboardPage from './DashboardPage';
import InputsPage from './InputsPage';
import { ArrowLeft, BarChart3, Edit3 } from 'lucide-react';

interface ProjetoDetailPageProps {
  projeto: ProjetoInputs;
  onUpdate: (p: ProjetoInputs) => void;
  onReset: (id: string) => void;
}

export default function ProjetoDetailPage({ projeto, onUpdate, onReset }: ProjetoDetailPageProps) {
  const [tab, setTab] = useState<'dashboard' | 'inputs'>('dashboard');
  const navigate = useNavigate();
  const resultado: ProjetoCompleto = calcularProjetoCompleto(projeto);

  const scoreColor = resultado.parecer.score >= 75 ? 'text-success'
    : resultado.parecer.score >= 55 ? 'text-warning'
    : 'text-destructive';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fade">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent hover:border-border/40 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl md:text-3xl text-foreground tracking-tight">{projeto.nome}</h1>
              <span className={`text-xs font-mono font-semibold ${scoreColor}`}>
                {resultado.parecer.score}pts
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {resultado.parecer.recomendacao}
            </p>
          </div>
        </div>
        <div className="flex bg-secondary/60 rounded-xl p-1 border border-border/40">
          <button
            onClick={() => setTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              tab === 'dashboard' 
                ? 'text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={tab === 'dashboard' ? { background: 'var(--gradient-gold)' } : undefined}
          >
            <BarChart3 size={15} /> Dashboard
          </button>
          <button
            onClick={() => setTab('inputs')}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              tab === 'inputs' 
                ? 'text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={tab === 'inputs' ? { background: 'var(--gradient-gold)' } : undefined}
          >
            <Edit3 size={15} /> Editar Números
          </button>
        </div>
      </div>

      {tab === 'dashboard' ? (
        <DashboardPage resultado={resultado} />
      ) : (
        <InputsPage projeto={projeto} onUpdate={onUpdate} onReset={onReset} />
      )}
    </div>
  );
}
