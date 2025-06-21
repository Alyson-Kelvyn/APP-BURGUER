import React, { useState, useEffect } from "react";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/Auth/LoginForm";
import { ProductForm } from "@/components/Admin/ProductForm";
import { ProductList } from "@/components/Admin/ProductList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  ArrowLeft,
  PlusCircle,
  List,
  BarChart2,
  Calendar,
} from "lucide-react";
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
  const [section, setSection] = useState<AdminSection>("pedidos");
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabaseRaw
        .from("orders")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
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

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentDate = () => {
    return formatDateToYYYYMMDD(new Date());
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
                <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold">Pedidos do Dia</h2>

                  {/* <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600 font-medium">
                      {formatDisplayDate(getCurrentDate())}
                    </span>
                  </div> */}
                </div>

                {orders.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <p className="text-lg">Nenhum pedido realizado hoje.</p>
                    <p className="text-sm mt-2">
                      Os pedidos aparecerão aqui quando houver agendamentos para
                      hoje.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h3 className="font-semibold text-orange-800">
                            📅 Resumo do Dia
                          </h3>
                          <p className="text-sm text-orange-600">
                            {orders.length} agendamento
                            {orders.length !== 1 ? "s" : ""} para hoje
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-orange-600">
                            Valor Total:
                          </p>
                          <p className="font-bold text-orange-800">
                            R${" "}
                            {orders
                              .reduce(
                                (total, order) =>
                                  total + Number(order.total_value),
                                0
                              )
                              .toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lista de agendamentos */}
                    {orders.map((order, index) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                      >
                        {/* Cabeçalho do agendamento */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-orange-100 text-orange-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">
                              {order.customer_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              📱 {order.customer_phone}
                            </p>
                          </div>
                        </div>

                        {/* Endereço de entrega */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            📍 Endereço de Entrega:
                          </p>
                          <p className="text-gray-600">
                            {order.address_street}, {order.address_number} -{" "}
                            {order.address_neighborhood}
                          </p>
                        </div>

                        {/* Itens do pedido */}
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            🍔 Itens do Pedido:
                          </p>
                          <div className="space-y-1">
                            {Array.isArray(order.order_items) ? (
                              (order.order_items as OrderItem[]).map(
                                (item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center text-sm"
                                  >
                                    <span className="text-gray-700">
                                      {item.quantity}x {item.name}
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      R${" "}
                                      {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <p className="text-gray-500 text-sm">
                                Nenhum item encontrado
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Rodapé com valor total, método de pagamento e horário */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-200">
                          <div className="flex flex-col gap-1">
                            <div className="text-xs text-gray-500">
                              <span className="font-semibold">
                                Pedido feito:
                              </span>{" "}
                              {(() => {
                                const orderDate = new Date(order.created_at);
                                // Adiciona 3 horas ao horário do pedido
                                orderDate.setHours(orderDate.getHours() + 3);
                                return orderDate.toLocaleString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "America/Fortaleza",
                                });
                              })()}
                            </div>
                            <div className="text-sm text-gray-600">
                              💳 {order.payment_method}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Valor Total:
                              </p>
                              <p className="text-2xl font-bold text-orange-600">
                                R$ {Number(order.total_value).toFixed(2)}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Confirmado
                            </span>
                          </div>
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
