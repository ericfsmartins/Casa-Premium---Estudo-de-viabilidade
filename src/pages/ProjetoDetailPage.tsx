import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjetoInputs, ProjetoCompleto, RiscoItem, ChecklistItem, TerrenoInfo, DecisaoComite } from '@/lib/types';
import { calcularProjetoCompleto } from '@/lib/calculos';
import DashboardPage from './DashboardPage';
import InputsPage from './InputsPage';
import TerrenoPage from './TerrenoPage';
import RiscosPage from './RiscosPage';
import ChecklistPage from './ChecklistPage';
import ComitePage from './ComitePage';
import MercadoPage from './MercadoPage';
import { ArrowLeft, BarChart3, Edit3, MapPin, Shield, CheckSquare, Gavel, TrendingUp } from 'lucide-react';

interface ProjetoDetailPageProps {
  projeto: ProjetoInputs;
  onUpdate: (p: ProjetoInputs) => void;
  onReset: (id: string) => void;
  onAddRisco: (projetoId: string, r: Omit<RiscoItem, 'id' | 'score'>) => void;
  onUpdateRisco: (projetoId: string, r: RiscoItem) => void;
  onRemoveRisco: (projetoId: string, id: string) => void;
  onUpdateChecklistItem: (projetoId: string, faseId: string, item: ChecklistItem) => void;
  onAddChecklistItem: (projetoId: string, faseId: string, texto: string) => void;
  onRemoveChecklistItem: (projetoId: string, faseId: string, itemId: string) => void;
  onUpdateTerreno: (projetoId: string, t: TerrenoInfo) => void;
  onAddDecisao: (projetoId: string, d: Omit<DecisaoComite, 'id' | 'dataDecisao'>) => void;
}

type Tab = 'dashboard' | 'inputs' | 'terreno' | 'mercado' | 'riscos' | 'checklist' | 'comite';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: <BarChart3 size={13} /> },
  { id: 'terreno',   label: 'Terreno',    icon: <MapPin size={13} /> },
  { id: 'mercado',   label: 'Mercado',    icon: <TrendingUp size={13} /> },
  { id: 'riscos',    label: 'Riscos',     icon: <Shield size={13} /> },
  { id: 'checklist', label: 'Checklist',  icon: <CheckSquare size={13} /> },
  { id: 'comite',    label: 'Comitê',     icon: <Gavel size={13} /> },
  { id: 'inputs',    label: 'Números',    icon: <Edit3 size={13} /> },
];

export default function ProjetoDetailPage({
  projeto, onUpdate, onReset,
  onAddRisco, onUpdateRisco, onRemoveRisco,
  onUpdateChecklistItem, onAddChecklistItem, onRemoveChecklistItem,
  onUpdateTerreno, onAddDecisao,
}: ProjetoDetailPageProps) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const navigate = useNavigate();
  const resultado: ProjetoCompleto = calcularProjetoCompleto(projeto);

  const scoreColor = resultado.parecer.score >= 75 ? 'text-success'
    : resultado.parecer.score >= 55 ? 'text-warning'
    : 'text-destructive';

  // Badges de atenção
  const riscosAbertos = (projeto.riscos || []).filter(r => r.status === 'Aberto').length;
  const itensCriticos = (projeto.checklist || []).flatMap(f => f.itens.filter(i => i.status === 'critico')).length;

  const tabBadge = (t: Tab) => {
    if (t === 'riscos' && riscosAbertos > 0) return riscosAbertos;
    if (t === 'checklist' && itensCriticos > 0) return itensCriticos;
    return null;
  };

  const goBack = () => navigate('/');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fade">
        <div className="flex items-center gap-3">
          <button onClick={goBack}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent hover:border-border/40 transition-all active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl md:text-3xl text-foreground tracking-tight">{projeto.nome}</h1>
              <span className={`text-xs font-mono font-semibold ${scoreColor}`}>{resultado.parecer.score}pts</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{resultado.parecer.recomendacao}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary/60 rounded-xl p-1 border border-border/40 overflow-x-auto gap-0.5">
        {TABS.map(t => {
          const badge = tabBadge(t.id);
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                tab === t.id
                  ? 'text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={tab === t.id ? { background: 'var(--gradient-gold)' } : undefined}
            >
              {t.icon} {t.label}
              {badge !== null && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {tab === 'dashboard' && <DashboardPage resultado={resultado} />}
      {tab === 'inputs' && <InputsPage projeto={projeto} onUpdate={onUpdate} onReset={onReset} />}
      {tab === 'terreno' && (
        <TerrenoPage
          projeto={projeto}
          estrategias={resultado.estrategiasCompra}
          onUpdate={(t) => onUpdateTerreno(projeto.id, t)}
          onBack={() => setTab('dashboard')}
        />
      )}
      {tab === 'mercado' && (
        <MercadoPage
          projeto={projeto}
          resultado={resultado}
          onUpdateTendencia={(t) => onUpdate({ ...projeto, mercadoTendencia: t })}
          onUpdatePerfil={(p) => onUpdate({ ...projeto, mercadoPerfil: p })}
          onBack={() => setTab('dashboard')}
        />
      )}
      {tab === 'riscos' && (
        <RiscosPage
          projeto={projeto}
          onAddRisco={(r) => onAddRisco(projeto.id, r)}
          onUpdateRisco={(r) => onUpdateRisco(projeto.id, r)}
          onRemoveRisco={(id) => onRemoveRisco(projeto.id, id)}
          onBack={() => setTab('dashboard')}
        />
      )}
      {tab === 'checklist' && (
        <ChecklistPage
          projeto={projeto}
          onUpdateItem={(faseId, item) => onUpdateChecklistItem(projeto.id, faseId, item)}
          onAddItem={(faseId, texto) => onAddChecklistItem(projeto.id, faseId, texto)}
          onRemoveItem={(faseId, itemId) => onRemoveChecklistItem(projeto.id, faseId, itemId)}
          onBack={() => setTab('dashboard')}
        />
      )}
      {tab === 'comite' && (
        <ComitePage
          projeto={projeto}
          resultado={resultado}
          onAddDecisao={(d) => onAddDecisao(projeto.id, d)}
          onBack={() => setTab('dashboard')}
        />
      )}
    </div>
  );
}
