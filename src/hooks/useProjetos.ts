import { useState, useCallback, useEffect, useMemo } from 'react';
import { ProjetoInputs, ProjetoCompleto } from '@/lib/types';
import { calcularProjetoCompleto } from '@/lib/calculos';
import { criarProjetoPadrao } from '@/lib/defaults';

const STORAGE_KEY = 'viabilidade_projetos';
const ACTIVE_KEY = 'viabilidade_ativo';

function loadProjetos(): ProjetoInputs[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return [criarProjetoPadrao()];
}

function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addProjeto = useCallback((nome: string) => {
    const novo = criarProjetoPadrao(nome);
    setProjetos(prev => {
      const next = [...prev, novo];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setActiveId(novo.id);
    return novo.id;
  }, [setActiveId]);

  const removeProjeto = useCallback((id: string) => {
    setProjetos(prev => {
      const next = prev.filter(p => p.id !== id);
      if (next.length === 0) next.push(criarProjetoPadrao());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    const novo = criarProjetoPadrao();
    setProjetos([novo]);
    setActiveId(novo.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([novo]));
  }, [setActiveId]);

  return {
    projetos, projetoAtivo, resultadoAtivo, todosResultados,
    activeId, setActiveId, updateProjeto, addProjeto, removeProjeto, resetProjeto, clearAll
  };
}
