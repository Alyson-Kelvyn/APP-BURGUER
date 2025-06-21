// Importações dos componentes de interface do usuário
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// Importações para gerenciamento de estado e roteamento
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Importação do contexto do carrinho de compras
import { CartProvider } from "@/contexts/CartContext";
// Importações das páginas da aplicação
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Criação da instância do cliente de consultas para gerenciar cache e estado
const queryClient = new QueryClient();

// Componente principal da aplicação
const App = () => (
  // Provedor do React Query para gerenciamento de estado e cache
  <QueryClientProvider client={queryClient}>
    {/* Provedor do contexto do carrinho de compras */}
    <CartProvider>
      {/* Provedor de tooltips para melhorar a experiência do usuário */}
      <TooltipProvider>
        {/* Componentes de notificação/toast para feedback ao usuário */}
        <Toaster />
        <Sonner />
        {/* Configuração do roteamento da aplicação */}
        <BrowserRouter>
          <Routes>
            {/* Rota principal - página inicial */}
            <Route path="/" element={<Index />} />
            {/* Rota para área administrativa */}
            <Route path="/admin" element={<Admin />} />
            {/* ADICIONE TODAS AS ROTAS PERSONALIZADAS ACIMA DA ROTA CATCH-ALL "*" */}
            {/* Rota para páginas não encontradas (404) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
