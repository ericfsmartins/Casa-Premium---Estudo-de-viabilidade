import { useState, useCallback } from 'react';
import { ArrowLeft, MapPin, FileCheck, Layers, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { TerrenoInfo, Topografia, Zoneamento, SituacaoDocumental, EstrategiaCompra, ProjetoInputs } from '@/lib/types';
import { fmtBRL, fmtPct } from '@/lib/formatters';

interface TerrenoPageProps {
  projeto: ProjetoInputs;
  estrategias: EstrategiaCompra[];
  onUpdate: (t: TerrenoInfo) => void;
  onBack: () => void;
}

const TOPOGRAFIAS: { value: Topografia; label: string; icon: string }[] = [
  { value: 'plano', label: 'Plano', icon: '▬' },
  { value: 'aclive', label: 'Aclive', icon: '↗' },
  { value: 'declive', label: 'Declive', icon: '↘' },
  { value: 'irregular', label: 'Irregular', icon: '〜' },
];

const ZONEAMENTOS: Zoneamento[] = ['ZR1', 'ZR2', 'ZR3', 'ZM', 'ZC', 'ZI', 'outro'];

const SIT_DOC: { value: SituacaoDocumental; label: string; color: string }[] = [
  { value: 'ok', label: '✅ Documentação OK', color: 'border-success/40 bg-success/8 text-success' },
  { value: 'pendente', label: '⚠️ Pendente', color: 'border-warning/40 bg-warning/8 text-warning' },
  { value: 'com_onus', label: '❌ Com Ônus', color: 'border-destructive/40 bg-destructive/8 text-destructive' },
];

function InfraToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${
        value
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-border/40 bg-muted/20 text-muted-foreground hover:border-border/60'
      }`}
    >
      {value ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {label}
    </button>
  );
}

function Field({ label, value, onChange, type = 'text', suffix }: {
  label: string; value: string | number; onChange: (v: string | number) => void;
  type?: 'text' | 'number'; suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)}
          className="input-premium w-full"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 font-mono">{suffix}</span>}
      </div>
    </div>
  );
}

function EstrategiaCard({ e }: { e: EstrategiaCompra }) {
  const roeOk = e.roe >= 1.0;
  const margemOk = e.margem >= 0.25;

  return (
    <div className={`rounded-xl p-5 border transition-all duration-300 relative ${
      e.recomendado
        ? 'border-primary/50 bg-primary/5 shadow-[0_0_24px_-6px_hsl(43_52%_54%_/_0.2)]'
        : 'border-border/40 bg-card/60'
    }`}>
      {e.recomendado && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shadow-md">
            ⭐ Recomendado
          </span>
        </div>
      )}

      <div className="flex items-start gap-2 mb-4">
        {e.tipo === 'avista' && <span className="text-2xl">💵</span>}
        {e.tipo === 'parcelamento' && <span className="text-2xl">📅</span>}
        {e.tipo === 'permuta' && <span className="text-2xl">🔄</span>}
        <div>
          <h3 className="font-display text-base font-semibold">{e.titulo}</h3>
          <p className="text-[10px] text-muted-foreground">{e.subtitulo}</p>
        </div>
      </div>

      <div className="space-y-2 text-[12px] font-mono mb-4">
        <div className="flex justify-between border-b border-border/20 pb-1.5">
          <span className="text-muted-foreground">Valor Total</span>
          <span className="font-semibold">{fmtBRL(e.valorTotal)}</span>
        </div>
        {e.tipo === 'avista' && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Proposta</span>
              <span>{fmtBRL(e.entrada)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desconto</span>
              <span className="text-success">{fmtBRL(e.valorTotal / (1 - e.desconto) - e.valorTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Condição</span>
              <span className="text-primary font-semibold">Pagamento integral à vista</span>
            </div>
          </>
        )}
        {e.tipo === 'parcelamento' && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada</span>
              <span>{fmtBRL(e.entrada)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo Financiado</span>
              <span>{fmtBRL(e.saldoFinanciado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Parcelas</span>
              <span>{e.parcelas}x de {fmtBRL(e.valorParcela)}</span>
            </div>
            <div className="flex justify-between border-t border-border/20 pt-1.5">
              <span className="text-muted-foreground">Custo Total</span>
              <span className="text-destructive/80">{fmtBRL(e.custoTotal)}</span>
            </div>
          </>
        )}
        {e.tipo === 'permuta' && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Permuta</span>
              <span>{fmtBRL(e.permutaValor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dinheiro</span>
              <span>{fmtBRL(e.dinheiroValor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Equity Reduzido</span>
              <span className={e.equityDelta < 0 ? 'text-success' : 'text-warning'}>
                {fmtBRL(e.equity)} {e.equityDelta < 0 ? `(-${fmtBRL(Math.abs(e.equityDelta))})` : ''}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'ROE', value: fmtPct(e.roe), ok: roeOk, delta: '' },
          { label: 'Margem', value: fmtPct(e.margem), ok: margemOk, delta: '' },
          { label: 'Lucro', value: fmtBRL(e.lucroLiquido), ok: e.lucroLiquido > 0, delta: '' },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-lg p-2 text-center border ${kpi.ok ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'}`}>
            <p className={`font-display font-bold text-sm ${kpi.ok ? 'text-success' : 'text-warning'}`}>{kpi.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border ${
        e.atendemMetas ? 'border-success/20 bg-success/5 text-success' : 'border-warning/20 bg-warning/5 text-warning'
      }`}>
        {e.atendemMetas ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
        {e.atendemMetas ? 'Atende às metas (ROE≥100%, Margem≥25%)' : 'Não atende às metas'}
      </div>
    </div>
  );
}

export default function TerrenoPage({ projeto, estrategias, onUpdate, onBack }: TerrenoPageProps) {
  const t = projeto.terreno!;
  const set = useCallback(<K extends keyof TerrenoInfo>(key: K, val: TerrenoInfo[K]) => {
    onUpdate({ ...t, [key]: val });
  }, [t, onUpdate]);

  const [tab, setTab] = useState<'dados' | 'estrategia'>('dados');

  const tabs = [
    { id: 'dados', label: '📋 Dados do Terreno' },
    { id: 'estrategia', label: '📊 Estratégia de Compra' },
  ] as const;

  const roeAlert = estrategias[0]?.roe < 1 ? 'ROE abaixo da meta. Priorize desconto à vista.' : null;

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
            <MapPin size={20} className="text-primary" /> Terreno
          </h1>
          <p className="text-[11px] text-muted-foreground">{projeto.nome}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary/60 rounded-xl p-1 border border-border/40 w-fit">
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              tab === tb.id ? 'text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
            }`}
            style={tab === tb.id ? { background: 'var(--gradient-gold)' } : undefined}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'dados' && (
        <div className="space-y-4 animate-fade">
          {/* Localização */}
          <div className="section-card p-5">
            <h2 className="font-display text-base mb-4 flex items-center gap-2">
              <MapPin size={15} className="text-primary" /> Localização
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Endereço" value={t.endereco} onChange={v => set('endereco', v as string)} />
              <Field label="Bairro" value={t.bairro} onChange={v => set('bairro', v as string)} />
              <Field label="Cidade" value={t.cidade} onChange={v => set('cidade', v as string)} />
              <Field label="Matrícula" value={t.matricula} onChange={v => set('matricula', v as string)} />
              <Field label="Testada (m)" value={t.testada} onChange={v => set('testada', v as number)} type="number" suffix="m" />
              <Field label="Profundidade (m)" value={t.profundidade} onChange={v => set('profundidade', v as number)} type="number" suffix="m" />
            </div>
          </div>

          {/* Características */}
          <div className="section-card p-5">
            <h2 className="font-display text-base mb-4 flex items-center gap-2">
              <Layers size={15} className="text-primary" /> Características
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Topografia</p>
                <div className="flex flex-wrap gap-2">
                  {TOPOGRAFIAS.map(tp => (
                    <button key={tp.value} onClick={() => set('topografia', tp.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        t.topografia === tp.value ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/40 bg-muted/20 text-muted-foreground hover:border-border/60'
                      }`}>
                      {tp.icon} {tp.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Zoneamento</p>
                <div className="flex flex-wrap gap-2">
                  {ZONEAMENTOS.map(z => (
                    <button key={z} onClick={() => set('zoneamento', z)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        t.zoneamento === z ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/40 bg-muted/20 text-muted-foreground hover:border-border/60'
                      }`}>
                      {z}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Field label="Recuo Frontal (m)" value={t.recuoFrontal} onChange={v => set('recuoFrontal', v as number)} type="number" suffix="m" />
              <Field label="Recuo Lateral (m)" value={t.recuoLateral} onChange={v => set('recuoLateral', v as number)} type="number" suffix="m" />
              <Field label="Recuo Fundos (m)" value={t.recuoFundos} onChange={v => set('recuoFundos', v as number)} type="number" suffix="m" />
            </div>
          </div>

          {/* Situação Documental */}
          <div className="section-card p-5">
            <h2 className="font-display text-base mb-4 flex items-center gap-2">
              <FileCheck size={15} className="text-primary" /> Situação Documental
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {SIT_DOC.map(s => (
                <button key={s.value} onClick={() => set('situacaoDocumental', s.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    t.situacaoDocumental === s.value ? s.color : 'border-border/30 bg-muted/20 text-muted-foreground hover:border-border/50'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Infraestrutura */}
          <div className="section-card p-5">
            <h2 className="font-display text-base mb-4 flex items-center gap-2">
              <Building2 size={15} className="text-primary" /> Infraestrutura Disponível
            </h2>
            <div className="flex flex-wrap gap-2">
              <InfraToggle label="Água" value={t.infraAgua} onChange={v => set('infraAgua', v)} />
              <InfraToggle label="Esgoto" value={t.infraEsgoto} onChange={v => set('infraEsgoto', v)} />
              <InfraToggle label="Pavimentação" value={t.infraPavimentacao} onChange={v => set('infraPavimentacao', v)} />
              <InfraToggle label="Calçada" value={t.infraCalcada} onChange={v => set('infraCalcada', v)} />
              <InfraToggle label="Elétrica" value={t.infraEletrica} onChange={v => set('infraEletrica', v)} />
              <InfraToggle label="Gás" value={t.infraGas} onChange={v => set('infraGas', v)} />
            </div>
          </div>

          {/* Confrontantes */}
          <div className="section-card p-5">
            <h2 className="font-display text-base mb-4">Confrontantes</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Frente" value={t.confrontanteFrente} onChange={v => set('confrontanteFrente', v as string)} />
              <Field label="Fundos" value={t.confrontanteFundos} onChange={v => set('confrontanteFundos', v as string)} />
              <Field label="Esquerda" value={t.confrontanteEsquerda} onChange={v => set('confrontanteEsquerda', v as string)} />
              <Field label="Direita" value={t.confrontanteDireita} onChange={v => set('confrontanteDireita', v as string)} />
            </div>
          </div>

          {/* Observações */}
          <div className="section-card p-5">
            <h2 className="font-display text-base mb-3">Observações</h2>
            <textarea
              value={t.observacoes}
              onChange={e => set('observacoes', e.target.value)}
              rows={3}
              className="input-premium w-full resize-none"
              placeholder="Anotações adicionais sobre o terreno..."
            />
          </div>
        </div>
      )}

      {tab === 'estrategia' && (
        <div className="space-y-4 animate-fade">
          {roeAlert && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-warning/8 border border-warning/20">
              <span className="text-warning text-lg">⚠️</span>
              <p className="text-sm text-warning/90">{roeAlert}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {estrategias.map(e => <EstrategiaCard key={e.tipo} e={e} />)}
          </div>
          <div className="section-card p-4">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Nota:</strong> Os cálculos de ROE/Margem/Lucro são simplificados para comparação das estratégias de aquisição. 
              Use o módulo Dashboard para a análise financeira completa com fluxo de caixa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
