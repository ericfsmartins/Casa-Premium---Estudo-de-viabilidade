import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import DashboardPage from "@/pages/DashboardPage";
import InputsPage from "@/pages/InputsPage";
import ComparativoPage from "@/pages/ComparativoPage";
import AjudaPage from "@/pages/AjudaPage";
import NotFound from "./pages/NotFound.tsx";
import { useProjetos } from "@/hooks/useProjetos";

const queryClient = new QueryClient();

function AppContent() {
  const { projetoAtivo, resultadoAtivo, todosResultados, updateProjeto, addProjeto, removeProjeto, resetProjeto, clearAll, setActiveId } = useProjetos();

  return (
    <>
      <Navbar resultado={resultadoAtivo} />
      <main className="pt-16 md:pt-16 pb-8 px-4 container mx-auto max-w-7xl">
        <Routes>
          <Route path="/" element={<DashboardPage resultado={resultadoAtivo} />} />
          <Route path="/novo" element={<InputsPage projeto={projetoAtivo} onUpdate={updateProjeto} onReset={resetProjeto} />} />
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
