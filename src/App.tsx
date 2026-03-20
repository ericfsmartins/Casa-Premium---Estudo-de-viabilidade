import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useParams, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import ProjetoDetailPage from "@/pages/ProjetoDetailPage";
import ComparativoPage from "@/pages/ComparativoPage";
import AjudaPage from "@/pages/AjudaPage";
import NotFound from "./pages/NotFound.tsx";
import { useProjetos } from "@/hooks/useProjetos";

const queryClient = new QueryClient();

function ProjetoRoute({ projetos, updateProjeto, resetProjeto, setActiveId }: {
  projetos: ReturnType<typeof useProjetos>['projetos'];
  updateProjeto: ReturnType<typeof useProjetos>['updateProjeto'];
  resetProjeto: ReturnType<typeof useProjetos>['resetProjeto'];
  setActiveId: ReturnType<typeof useProjetos>['setActiveId'];
}) {
  const { id } = useParams<{ id: string }>();
  const projeto = projetos.find(p => p.id === id);
  if (!projeto) return <Navigate to="/" replace />;
  setActiveId(projeto.id);
  return <ProjetoDetailPage projeto={projeto} onUpdate={updateProjeto} onReset={resetProjeto} />;
}

function AppContent() {
  const ctx = useProjetos();
  const { projetos, resultadoAtivo, todosResultados, updateProjeto, addProjeto, removeProjeto, resetProjeto, clearAll, setActiveId } = ctx;

  return (
    <>
      <Navbar resultado={resultadoAtivo} />
      <main className="pt-16 md:pt-16 pb-8 px-4 container mx-auto max-w-7xl">
        <Routes>
          <Route path="/" element={<HomePage resultados={todosResultados} onSetActive={setActiveId} onAdd={(nome) => { addProjeto(nome); }} />} />
          <Route path="/projeto/:id" element={
            <ProjetoRoute projetos={projetos} updateProjeto={updateProjeto} resetProjeto={resetProjeto} setActiveId={setActiveId} />
          } />
          <Route path="/comparativo" element={<ComparativoPage resultados={todosResultados} onSetActive={setActiveId} onRemove={removeProjeto} onAdd={addProjeto} onClearAll={clearAll} />} />
          <Route path="/ajuda" element={<AjudaPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
