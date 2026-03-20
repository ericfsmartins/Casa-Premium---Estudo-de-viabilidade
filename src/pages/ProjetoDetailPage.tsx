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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display text-2xl text-foreground">{projeto.nome}</h1>
            <p className="text-[11px] text-muted-foreground">
              {resultado.parecer.recomendacao}
            </p>
          </div>
        </div>
        <div className="flex bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setTab('dashboard')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              tab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 size={14} /> Dashboard
          </button>
          <button
            onClick={() => setTab('inputs')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              tab === 'inputs' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 size={14} /> Editar Números
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
