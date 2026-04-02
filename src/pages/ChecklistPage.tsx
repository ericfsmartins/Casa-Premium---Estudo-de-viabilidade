import { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, CheckSquare, X, Calendar, User } from 'lucide-react';
import { ChecklistFase, ChecklistItem, ChecklistStatus, ProjetoInputs } from '@/lib/types';

interface ChecklistPageProps {
  projeto: ProjetoInputs;
  onUpdateItem: (faseId: string, item: ChecklistItem) => void;
  onAddItem: (faseId: string, texto: string) => void;
  onRemoveItem: (faseId: string, itemId: string) => void;
  onBack: () => void;
}

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; color: string; bg: string; icon: string }> = {
  pendente:    { label: 'Pendente',    color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/40', icon: '⏳' },
  em_progresso:{ label: 'Em Andamento',color: 'text-info',             bg: 'bg-info/8 border-info/20',    icon: '🔄' },
  critico:     { label: 'Crítico',     color: 'text-destructive',      bg: 'bg-destructive/8 border-destructive/20', icon: '🚨' },
  concluido:   { label: 'Concluído',   color: 'text-success',          bg: 'bg-success/8 border-success/20', icon: '✅' },
};

const STATUS_LIST: ChecklistStatus[] = ['pendente', 'em_progresso', 'critico', 'concluido'];

function calcProgresso(fase: ChecklistFase) {
  const total = fase.itens.length;
  if (total === 0) return 0;
  const ok = fase.itens.filter(i => i.status === 'concluido').length;
  return Math.round((ok / total) * 100);
}

function calcProgressoGeral(fases: ChecklistFase[]) {
  const total = fases.reduce((s, f) => s + f.itens.length, 0);
  if (total === 0) return 0;
  const ok = fases.reduce((s, f) => s + f.itens.filter(i => i.status === 'concluido').length, 0);
  return Math.round((ok / total) * 100);
}

function calcCriticos(fases: ChecklistFase[]) {
  return fases.flatMap(f => f.itens.filter(i => i.status === 'critico'));
}

function ItemModal({ item, onSave, onClose }: {
  item: ChecklistItem;
  onSave: (i: ChecklistItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...item });
  const set = <K extends keyof ChecklistItem>(k: K, v: ChecklistItem[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl p-6 space-y-4 animate-scale">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Editar Item</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground transition-colors"><X size={16} /></button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Descrição</label>
          <input value={form.texto} onChange={e => set('texto', e.target.value)} className="input-premium w-full" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 block">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_LIST.map(s => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button key={s} onClick={() => set('status', s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    form.status === s ? cfg.bg + ' ' + cfg.color : 'border-border/30 bg-muted/20 text-muted-foreground'
                  }`}>
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Responsável</label>
            <div className="relative">
              <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input value={form.responsavel} onChange={e => set('responsavel', e.target.value)}
                className="input-premium w-full pl-8" placeholder="Nome..." />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Prazo</label>
            <div className="relative">
              <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input type="date" value={form.prazo} onChange={e => set('prazo', e.target.value)}
                className="input-premium w-full pl-8" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Nota</label>
          <textarea rows={2} value={form.nota} onChange={e => set('nota', e.target.value)}
            className="input-premium w-full resize-none" placeholder="Observações adicionais..." />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancelar</button>
          <button onClick={() => { onSave(form); onClose(); }} className="btn-primary flex-1 justify-center">Salvar</button>
        </div>
      </div>
    </div>
  );
}

function AddItemForm({ faseId, onAdd }: { faseId: string; onAdd: (faseId: string, texto: string) => void }) {
  const [texto, setTexto] = useState('');
  return (
    <div className="flex gap-2 mt-3">
      <input value={texto} onChange={e => setTexto(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && texto.trim()) { onAdd(faseId, texto.trim()); setTexto(''); } }}
        className="input-premium flex-1 text-xs" placeholder="Novo item... (Enter para adicionar)" />
      <button
        onClick={() => { if (texto.trim()) { onAdd(faseId, texto.trim()); setTexto(''); } }}
        className="btn-primary text-xs !px-3 !py-2">
        <Plus size={13} />
      </button>
    </div>
  );
}

export default function ChecklistPage({ projeto, onUpdateItem, onAddItem, onRemoveItem, onBack }: ChecklistPageProps) {
  const fases = projeto.checklist || [];
  const [editItem, setEditItem] = useState<{ faseId: string; item: ChecklistItem } | null>(null);
  const progressoGeral = calcProgressoGeral(fases);
  const criticos = calcCriticos(fases);
  const concluidos = fases.reduce((s, f) => s + f.itens.filter(i => i.status === 'concluido').length, 0);
  const total = fases.reduce((s, f) => s + f.itens.length, 0);

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
            <CheckSquare size={20} className="text-primary" /> Checklist
          </h1>
          <p className="text-[11px] text-muted-foreground">{projeto.nome}</p>
        </div>
      </div>

      {/* Progresso Geral */}
      <div className="section-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-base">Progresso Geral</p>
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-primary">{progressoGeral}%</span>
            {criticos.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-bold">
                {criticos.length} crítico{criticos.length > 1 ? 's' : ''} pendente{criticos.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressoGeral === 100 ? 'bg-success' : 'bg-primary'}`}
            style={{ width: `${progressoGeral}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">{concluidos} de {total} itens concluídos</p>
      </div>

      {/* Alertas críticos */}
      {criticos.length > 0 && (
        <div className="section-card p-4 border-destructive/30 bg-destructive/3 space-y-2">
          <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">🚨 Itens Críticos</p>
          {criticos.map(it => (
            <p key={it.id} className="text-xs text-destructive/80">• {it.texto} {it.responsavel ? `— Resp: ${it.responsavel}` : ''} {it.prazo ? `— Prazo: ${it.prazo}` : ''}</p>
          ))}
        </div>
      )}

      {/* Fases */}
      {fases.map(fase => {
        const prog = calcProgresso(fase);
        return (
          <div key={fase.id} className="section-card">
            <div className="px-5 py-4 border-b border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{fase.icone}</span>
                  <h2 className="font-display text-base">{fase.nome}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {fase.itens.filter(i => i.status === 'concluido').length}/{fase.itens.length}
                  </span>
                  <div className="w-16 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${prog === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${prog}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3">
              {fase.itens.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">Nenhum item nesta fase</p>
              ) : (
                <div className="space-y-2">
                  {fase.itens.map(item => {
                    const cfg = STATUS_CONFIG[item.status];
                    return (
                      <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${cfg.bg}`}>
                        <button
                          onClick={() => onUpdateItem(fase.id, {
                            ...item,
                            status: item.status === 'concluido' ? 'pendente' : 'concluido'
                          })}
                          className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                            item.status === 'concluido'
                              ? 'border-success bg-success/20 text-success'
                              : item.status === 'critico'
                                ? 'border-destructive bg-destructive/10'
                                : 'border-border/50 hover:border-primary/50'
                          }`}
                        >
                          {item.status === 'concluido' && <span className="text-[10px]">✓</span>}
                          {item.status === 'critico' && <span className="text-[10px]">!</span>}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${item.status === 'concluido' ? 'line-through text-muted-foreground/60' : ''}`}>{item.texto}</p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {item.responsavel && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <User size={9} /> {item.responsavel}
                              </span>
                            )}
                            {item.prazo && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar size={9} /> {item.prazo}
                              </span>
                            )}
                            {item.nota && <span className="text-[10px] text-muted-foreground/70 italic">{item.nota}</span>}
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setEditItem({ faseId: fase.id, item })}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                            <Pencil size={11} />
                          </button>
                          <button onClick={() => onRemoveItem(fase.id, item.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <AddItemForm faseId={fase.id} onAdd={onAddItem} />
            </div>
          </div>
        );
      })}

      {/* Modal de edição */}
      {editItem && (
        <ItemModal
          item={editItem.item}
          onSave={item => onUpdateItem(editItem.faseId, item)}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
