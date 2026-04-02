import { useState, useCallback, useMemo } from 'react';
import { ProjetoInputs, ProjetoCompleto, RiscoItem, ChecklistFase, ChecklistItem, DecisaoComite, TerrenoInfo, IMPACTO_NUM } from '@/lib/types';
import { calcularProjetoCompleto } from '@/lib/calculos';
import { criarProjetoPadrao, criarChecklistPadrao, criarTerrenoPadrao } from '@/lib/defaults';
import { v4Fallback } from '@/lib/utils-id';

const STORAGE_KEY = 'viabilidade_projetos_v2';
const ACTIVE_KEY = 'viabilidade_ativo';

function ensureModulos(p: ProjetoInputs): ProjetoInputs {
  return {
    ...p,
    modalidadeFinanciamento: p.modalidadeFinanciamento || 'terreno_construcao',
    terreno: p.terreno || criarTerrenoPadrao(),
    riscos: p.riscos || [],
    checklist: p.checklist || criarChecklistPadrao(),
    decisoes: p.decisoes || [],
    mercadoTendencia: p.mercadoTendencia || 'estavel',
    mercadoPerfil: p.mercadoPerfil || 'familia',
  };
}

function loadProjetos(): ProjetoInputs[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as ProjetoInputs[];
      return parsed.map(ensureModulos);
    }
    // Try legacy key
    const legacy = localStorage.getItem('viabilidade_projetos');
    if (legacy) {
      const parsed = JSON.parse(legacy) as ProjetoInputs[];
      return parsed.map(ensureModulos);
    }
  } catch { /* ignore */ }
  return [criarProjetoPadrao()];
}

function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

function saveProjetos(projetos: ProjetoInputs[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projetos));
}

export function useProjetos() {
  const [projetos, setProjetos] = useState<ProjetoInputs[]>(loadProjetos);
  const [activeId, setActiveIdState] = useState<string>(() => {
    const saved = loadActiveId();
    const projs = loadProjetos();
    return saved && projs.find(p => p.id === saved) ? saved : projs[0]?.id || '';
  });

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const projetoAtivo = useMemo(() => projetos.find(p => p.id === activeId) || projetos[0], [projetos, activeId]);
  const resultadoAtivo: ProjetoCompleto = useMemo(() => calcularProjetoCompleto(projetoAtivo), [projetoAtivo]);
  const todosResultados: ProjetoCompleto[] = useMemo(() => projetos.map(calcularProjetoCompleto), [projetos]);

  const updateProjeto = useCallback((updated: ProjetoInputs) => {
    setProjetos(prev => {
      const next = prev.map(p => p.id === updated.id ? updated : p);
      saveProjetos(next);
      return next;
    });
  }, []);

  const addProjeto = useCallback((nome: string) => {
    const novo = criarProjetoPadrao(nome);
    setProjetos(prev => {
      const next = [...prev, novo];
      saveProjetos(next);
      return next;
    });
    setActiveId(novo.id);
    return novo.id;
  }, [setActiveId]);

  const removeProjeto = useCallback((id: string) => {
    setProjetos(prev => {
      const next = prev.filter(p => p.id !== id);
      if (next.length === 0) next.push(criarProjetoPadrao());
      saveProjetos(next);
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
  }, [activeId, setActiveId]);

  const resetProjeto = useCallback((id: string) => {
    setProjetos(prev => {
      const existing = prev.find(p => p.id === id);
      const reset = criarProjetoPadrao(existing?.nome || 'Novo Projeto');
      reset.id = id;
      const next = prev.map(p => p.id === id ? reset : p);
      saveProjetos(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    const novo = criarProjetoPadrao();
    setProjetos([novo]);
    setActiveId(novo.id);
    saveProjetos([novo]);
  }, [setActiveId]);

  // ── Riscos ──────────────────────────────────────────────────
  const addRisco = useCallback((projetoId: string, risco: Omit<RiscoItem, 'id' | 'score'>) => {
    setProjetos(prev => {
      const next = prev.map(p => {
        if (p.id !== projetoId) return p;
        const impNum = IMPACTO_NUM[risco.impacto];
        const score = risco.probabilidade * impNum;
        const newRisco: RiscoItem = { ...risco, id: v4Fallback(), score };
        return { ...p, riscos: [...(p.riscos || []), newRisco] };
      });
      saveProjetos(next);
      return next;
    });
  }, []);

  const updateRisco = useCallback((projetoId: string, risco: RiscoItem) => {
    setProjetos(prev => {
      const next = prev.map(p => {
        if (p.id !== projetoId) return p;
        const impNum = IMPACTO_NUM[risco.impacto];
        const updated = { ...risco, score: risco.probabilidade * impNum };
        return { ...p, riscos: (p.riscos || []).map(r => r.id === risco.id ? updated : r) };
      });
      saveProjetos(next);
      return next;
    });
  }, []);

  const removeRisco = useCallback((projetoId: string, riscoId: string) => {
    setProjetos(prev => {
      const next = prev.map(p => p.id !== projetoId ? p : { ...p, riscos: (p.riscos || []).filter(r => r.id !== riscoId) });
      saveProjetos(next);
      return next;
    });
  }, []);

  // ── Checklist ───────────────────────────────────────────────
  const updateChecklistItem = useCallback((projetoId: string, faseId: string, item: ChecklistItem) => {
    setProjetos(prev => {
      const next = prev.map(p => {
        if (p.id !== projetoId) return p;
        const fases = (p.checklist || []).map(f =>
          f.id !== faseId ? f : { ...f, itens: f.itens.map(it => it.id === item.id ? item : it) }
        );
        return { ...p, checklist: fases };
      });
      saveProjetos(next);
      return next;
    });
  }, []);

  const addChecklistItem = useCallback((projetoId: string, faseId: string, texto: string) => {
    setProjetos(prev => {
      const next = prev.map(p => {
        if (p.id !== projetoId) return p;
        const newItem: ChecklistItem = { id: v4Fallback(), texto, status: 'pendente', responsavel: '', prazo: '', nota: '' };
        const fases = (p.checklist || []).map(f =>
          f.id !== faseId ? f : { ...f, itens: [...f.itens, newItem] }
        );
        return { ...p, checklist: fases };
      });
      saveProjetos(next);
      return next;
    });
  }, []);

  const removeChecklistItem = useCallback((projetoId: string, faseId: string, itemId: string) => {
    setProjetos(prev => {
      const next = prev.map(p => {
        if (p.id !== projetoId) return p;
        const fases = (p.checklist || []).map(f =>
          f.id !== faseId ? f : { ...f, itens: f.itens.filter(it => it.id !== itemId) }
        );
        return { ...p, checklist: fases };
      });
      saveProjetos(next);
      return next;
    });
  }, []);

  // ── Terreno ─────────────────────────────────────────────────
  const updateTerreno = useCallback((projetoId: string, terreno: TerrenoInfo) => {
    setProjetos(prev => {
      const next = prev.map(p => p.id !== projetoId ? p : { ...p, terreno });
      saveProjetos(next);
      return next;
    });
  }, []);

  // ── Comitê ──────────────────────────────────────────────────
  const addDecisao = useCallback((projetoId: string, decisao: Omit<DecisaoComite, 'id' | 'dataDecisao'>) => {
    setProjetos(prev => {
      const next = prev.map(p => {
        if (p.id !== projetoId) return p;
        const nova: DecisaoComite = { ...decisao, id: v4Fallback(), dataDecisao: new Date().toISOString() };
        return { ...p, decisoes: [...(p.decisoes || []), nova] };
      });
      saveProjetos(next);
      return next;
    });
  }, []);

  return {
    projetos, projetoAtivo, resultadoAtivo, todosResultados,
    activeId, setActiveId, updateProjeto, addProjeto, removeProjeto, resetProjeto, clearAll,
    addRisco, updateRisco, removeRisco,
    updateChecklistItem, addChecklistItem, removeChecklistItem,
    updateTerreno, addDecisao,
  };
}
