import React, { useState, useEffect } from "react";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/Auth/LoginForm";
import { ProductForm } from "@/components/Admin/ProductForm";
import { ProductList } from "@/components/Admin/ProductList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ArrowLeft, PlusCircle, List, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Sidebar imports
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Tables } from "@/integrations/supabase/types";
import { createClient } from "@supabase/supabase-js";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

type AdminSection = "adicionar" | "pedidos" | "estatisticas";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  order_items: OrderItem[];
  total_value: number;
  payment_method: string;
}

function formatDateToYYYYMMDD(date: Date) {
  return date.toISOString().split("T")[0];
}

const supabaseRaw = createClient(
  "https://tkwttdjpkynqprszlmmr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrd3R0ZGpwa3lucXByc3psbW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjU1NjEsImV4cCI6MjA2NTg0MTU2MX0._nj90k5DdOSrscu1iwdr1Fmp34gjCRuLa0hSK-ktGSk"
);

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>("pedidos");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar produtos",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabaseRaw
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast({
          title: "Erro ao carregar pedidos",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os pedidos.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut();
      setIsAuthenticated(false);
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleBackToSite = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar className="bg-white border-r">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={section === "adicionar"}
                  onClick={() => setSection("adicionar")}
                  tooltip="Adicionar Produto"
                >
                  <PlusCircle className="mr-2" /> Adicionar Produto
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={section === "pedidos"}
                  onClick={() => setSection("pedidos")}
                  tooltip="Pedidos"
                >
                  <List className="mr-2" /> Pedidos
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={section === "estatisticas"}
                  onClick={() => setSection("estatisticas")}
                  tooltip="Estatísticas"
                >
                  <BarChart2 className="mr-2" /> Estatísticas
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button
              variant="outline"
              onClick={handleBackToSite}
              className="flex items-center gap-2 w-full mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Menu Principal
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-2xl font-bold text-orange-600">
                    Administração - Burger House
                  </h1>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {section === "adicionar" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <ProductForm onProductAdded={fetchProducts} />
                </div>
                <div>
                  <ProductList
                    products={products}
                    onProductDeleted={fetchProducts}
                  />
                </div>
              </div>
            )}
            {section === "pedidos" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Pedidos do Dia</h2>
                {orders.length === 0 ? (
                  <div className="text-gray-500">
                    Nenhum pedido realizado hoje.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded shadow p-4 border flex flex-col gap-2"
                      >
                        <div>
                          <span className="font-semibold">Nome:</span>{" "}
                          {order.customer_name}
                        </div>
                        <div>
                          <span className="font-semibold">Número:</span>{" "}
                          {order.customer_phone}
                        </div>
                        <div>
                          <span className="font-semibold">Endereço:</span>{" "}
                          {order.address_street}, {order.address_number} -{" "}
                          {order.address_neighborhood}
                        </div>
                        <div>
                          <span className="font-semibold">Valor Total:</span>{" "}
                          <span className="text-orange-600 font-bold">
                            R$ {Number(order.total_value).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">Pagamento:</span>{" "}
                          {order.payment_method}
                        </div>
                        <div>
                          <span className="font-semibold">Pedido:</span>
                          <ul className="list-disc ml-6 mt-1">
                            {Array.isArray(order.order_items)
                              ? (order.order_items as OrderItem[]).map(
                                  (item, idx) => (
                                    <li key={idx}>
                                      {item.quantity}x {item.name} - R${" "}
                                      {(item.price * item.quantity).toFixed(2)}
                                    </li>
                                  )
                                )
                              : null}
                          </ul>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(order.created_at).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "America/Fortaleza",
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {section === "estatisticas" && (
              <div className="text-xl text-gray-700">
                Área de estatísticas (em breve)
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
