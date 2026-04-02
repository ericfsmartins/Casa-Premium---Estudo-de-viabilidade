import { useState, useCallback } from 'react';
import { ChevronDown, Plus, Trash2, RotateCcw, Save } from 'lucide-react';
import { ProjetoInputs, Comparavel, ModalidadeFinanciamento } from '@/lib/types';
import { toast } from 'sonner';

interface InputsPageProps {
  projeto: ProjetoInputs;
  onUpdate: (p: ProjetoInputs) => void;
  onReset: (id: string) => void;
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors active:scale-[0.998]"
      >
        <span className="font-display text-base text-foreground">{title}</span>
        <div className={`p-1 rounded-md bg-muted/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown size={14} className="text-muted-foreground" />
        </div>
      </button>
      {open && <div className="px-5 pb-5 pt-3 border-t border-border/30 animate-fade">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = 'currency', suffix, prefix, max }: {
  label: string; value: number | string; onChange: (v: number | string) => void;
  type?: 'currency' | 'percent' | 'number' | 'text' | 'slider'; suffix?: string; prefix?: string; max?: number;
}) {
  if (type === 'text') {
    return (
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">{label}</label>
        <input
          type="text"
          value={value as string}
          onChange={e => onChange(e.target.value)}
          className="input-premium w-full"
        />
      </div>
    );
  }
  if (type === 'slider') {
    const numVal = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    const sliderMax = max ?? 0.9;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground font-medium">{label}</label>
          <span className="text-xs font-mono text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-md">{(numVal * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0" max={String(sliderMax)} step="0.01"
          value={numVal}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full accent-primary h-1.5 cursor-pointer"
        />
      </div>
    );
  }
  const numVal = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 font-mono">{prefix}</span>}
        <input
          type="number"
          step={type === 'percent' ? '0.1' : '1'}
          value={type === 'percent' ? (numVal * 100).toFixed(2) : numVal}
          onChange={e => {
            const raw = parseFloat(e.target.value) || 0;
            onChange(type === 'percent' ? raw / 100 : raw);
          }}
          className={`input-premium w-full ${prefix ? 'pl-10' : ''}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 font-mono">{suffix}</span>}
      </div>
    </div>
  );
}

export default function InputsPage({ projeto, onUpdate, onReset }: InputsPageProps) {
  const set = useCallback(<K extends keyof ProjetoInputs>(key: K, val: ProjetoInputs[K]) => {
    onUpdate({ ...projeto, [key]: val });
  }, [projeto, onUpdate]);

  const updateComp = useCallback((idx: number, field: keyof Comparavel, val: string | number) => {
    const comps = [...projeto.comparaveis];
    comps[idx] = { ...comps[idx], [field]: val };
    onUpdate({ ...projeto, comparaveis: comps });
  }, [projeto, onUpdate]);

  const addComp = () => {
    if (projeto.comparaveis.length >= 6) return;
    onUpdate({ ...projeto, comparaveis: [...projeto.comparaveis, { descricao: '', area: 0, preco: 0 }] });
  };

  const removeComp = (idx: number) => {
    onUpdate({ ...projeto, comparaveis: projeto.comparaveis.filter((_, i) => i !== idx) });
  };

  const grid = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between animate-fade">
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-1">Parâmetros</p>
          <h1 className="font-display text-2xl text-foreground">Dados do Projeto</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { onReset(projeto.id); toast.success('Projeto resetado'); }}
            className="btn-ghost text-xs">
            <RotateCcw size={14} /> Resetar
          </button>
          <button onClick={() => { onUpdate(projeto); toast.success('Projeto salvo!'); }}
            className="btn-primary text-xs !px-4 !py-2">
            <Save size={14} /> Salvar
          </button>
        </div>
      </div>

      <Section title="1 — Dados do Imóvel">
        <div className={grid}>
          <Field label="Nome do projeto" value={projeto.nome} onChange={v => set('nome', v as string)} type="text" />
          <Field label="Valor do lote" value={projeto.valorLote} onChange={v => set('valorLote', v as number)} prefix="R$" />
          <Field label="Área do lote (m²)" value={projeto.areaLote} onChange={v => set('areaLote', v as number)} />
          <Field label="Área construída (m²)" value={projeto.areaConstruida} onChange={v => set('areaConstruida', v as number)} />
          <Field label="Custo construção (R$/m²)" value={projeto.custoPorM2} onChange={v => set('custoPorM2', v as number)} prefix="R$" />
          <Field label="Valor de venda estimado" value={projeto.valorVenda} onChange={v => set('valorVenda', v as number)} prefix="R$" />
          <Field label="Preço médio mercado (R$/m²)" value={projeto.precoMercado} onChange={v => set('precoMercado', v as number)} prefix="R$" />
        </div>
      </Section>

      <Section title="2 — Financiamento">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-2 block">Modalidade de financiamento</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  set('modalidadeFinanciamento', 'terreno_construcao');
                  if (projeto.percLTV > 0.80) set('percLTV', 0.80);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  projeto.modalidadeFinanciamento === 'terreno_construcao'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Terreno + Construção
              </button>
              <button
                onClick={() => set('modalidadeFinanciamento', 'so_construcao')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  projeto.modalidadeFinanciamento === 'so_construcao'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Só Construção
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-1.5">
              {projeto.modalidadeFinanciamento === 'terreno_construcao'
                ? 'Banco financia até 80% do (terreno + construção). Liberação do terreno no mês 0 e construção em tranches.'
                : 'Banco financia até 100% da construção. O terreno sai 100% do seu caixa (equity).'}
            </p>
          </div>
          <div className={grid}>
            <Field
              label="% Financiamento (LTV)"
              value={projeto.percLTV}
              onChange={v => set('percLTV', v as number)}
              type="slider"
              max={projeto.modalidadeFinanciamento === 'so_construcao' ? 1.0 : 0.80}
            />
            <Field label="Taxa de juros anual" value={projeto.taxaAnual} onChange={v => set('taxaAnual', v as number)} type="percent" suffix="%" />
            <Field label="Prazo (meses)" value={projeto.prazoMeses} onChange={v => set('prazoMeses', v as number)} />
          </div>
        </div>
      </Section>

      <Section title="3 — Cronograma">
        <div className={grid}>
          <Field label="Meses pré-obra" value={projeto.mesesPreObra} onChange={v => set('mesesPreObra', v as number)} />
          <Field label="Meses de obra" value={projeto.mesesObra} onChange={v => set('mesesObra', v as number)} />
          <Field label="Meses pós-obra — Cenário A" value={projeto.mesesPosA} onChange={v => set('mesesPosA', v as number)} />
          <Field label="Meses pós-obra — Cenário B" value={projeto.mesesPosB} onChange={v => set('mesesPosB', v as number)} />
          <Field label="Meses pós-obra — Cenário C" value={projeto.mesesPosC} onChange={v => set('mesesPosC', v as number)} />
        </div>
      </Section>

      <Section title="4 — Custos Fixos (Carrego)">
        <div className={grid}>
          <Field label="Condomínio mensal" value={projeto.condominio} onChange={v => set('condominio', v as number)} prefix="R$" />
          <Field label="IPTU anual" value={projeto.iptuAnual} onChange={v => set('iptuAnual', v as number)} prefix="R$" />
        </div>
      </Section>

      <Section title="5 — Impostos e Comissões">
        <div className={grid}>
          <Field label="Comissão imobiliária" value={projeto.comissao} onChange={v => set('comissao', v as number)} type="percent" suffix="%" />
          <Field label="IR ganho de capital" value={projeto.ir} onChange={v => set('ir', v as number)} type="percent" suffix="%" />
          <Field label="TMA — Taxa Mín. Atratividade" value={projeto.tma} onChange={v => set('tma', v as number)} type="percent" suffix="%" />
        </div>
      </Section>

      <Section title="6 — Custos Pré-Obra" defaultOpen={false}>
        <div className={grid}>
          <Field label="ITBI (% sobre terreno)" value={projeto.percITBI} onChange={v => set('percITBI', v as number)} type="percent" suffix="%" />
          <Field label="Escritura / Registro" value={projeto.escrituraRegistro} onChange={v => set('escrituraRegistro', v as number)} prefix="R$" />
          <Field label="Projeto Arquitetônico" value={projeto.projetoArquitetonico} onChange={v => set('projetoArquitetonico', v as number)} prefix="R$" />
          <Field label="Projetos Elétrico/Hidráulico" value={projeto.projetosEletricoHidraulico} onChange={v => set('projetosEletricoHidraulico', v as number)} prefix="R$" />
          <Field label="Estrutural + ART" value={projeto.estruturalART} onChange={v => set('estruturalART', v as number)} prefix="R$" />
          <Field label="Topografia / Sondagem" value={projeto.topografiaSondagem} onChange={v => set('topografiaSondagem', v as number)} prefix="R$" />
          <Field label="Render / 3D" value={projeto.render3D} onChange={v => set('render3D', v as number)} prefix="R$" />
          <Field label="Taxas Caixa / Engenharia" value={projeto.taxasCaixaEngenharia} onChange={v => set('taxasCaixaEngenharia', v as number)} prefix="R$" />
          <Field label="Seguro Inicial" value={projeto.seguroInicial} onChange={v => set('seguroInicial', v as number)} prefix="R$" />
          <Field label="Alvará / Prefeitura" value={projeto.alvaraPrefeitura} onChange={v => set('alvaraPrefeitura', v as number)} prefix="R$" />
          <Field label="Placa de Obra" value={projeto.placaObra} onChange={v => set('placaObra', v as number)} prefix="R$" />
        </div>
      </Section>

      <Section title="7 — Custos Durante Obra" defaultOpen={false}>
        <div className={grid}>
          <Field label="INSS de Obra" value={projeto.inssObra} onChange={v => set('inssObra', v as number)} prefix="R$" />
          <Field label="Vistorias Banco" value={projeto.vistoriasBanco} onChange={v => set('vistoriasBanco', v as number)} prefix="R$" />
          <Field label="Habite-se" value={projeto.habitese} onChange={v => set('habitese', v as number)} prefix="R$" />
          <Field label="Averbação / Cartório" value={projeto.averbacaoCartorio} onChange={v => set('averbacaoCartorio', v as number)} prefix="R$" />
        </div>
      </Section>

      <Section title="8 — Comparáveis de Mercado" defaultOpen={false}>
        <div className="space-y-3 mt-1">
          <div className="hidden sm:grid grid-cols-[1fr_100px_140px_100px_40px] gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1">
            <span>Descrição</span><span>Área (m²)</span><span>Preço (R$)</span><span>R$/m²</span><span></span>
          </div>
          {projeto.comparaveis.map((comp, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_140px_100px_40px] gap-2 items-center">
              <input className="input-premium" value={comp.descricao} onChange={e => updateComp(idx, 'descricao', e.target.value)} placeholder="Descrição" />
              <input className="input-premium" type="number" value={comp.area} onChange={e => updateComp(idx, 'area', parseFloat(e.target.value) || 0)} />
              <input className="input-premium" type="number" value={comp.preco} onChange={e => updateComp(idx, 'preco', parseFloat(e.target.value) || 0)} />
              <span className="text-sm font-mono text-muted-foreground px-1">
                {comp.area > 0 ? (comp.preco / comp.area).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '—'}
              </span>
              <button onClick={() => removeComp(idx)} className="text-muted-foreground hover:text-destructive transition-colors active:scale-90 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {projeto.comparaveis.length < 6 && (
            <button onClick={addComp} className="flex items-center gap-1.5 text-xs text-primary font-medium hover:opacity-80 transition-opacity active:scale-95 mt-2">
              <Plus size={14} /> Adicionar comparável
            </button>
          )}
        </div>
      </Section>
    </div>
  );
}
