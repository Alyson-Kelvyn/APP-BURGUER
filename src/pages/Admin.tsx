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
  Edit,
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tables } from "@/integrations/supabase/types";
import { createClient } from "@supabase/supabase-js";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
}

type AdminSection = "adicionar" | "pedidos" | "estatisticas" | "ajustes";

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

function SidebarMenuButtonIcon() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="p-2 rounded hover:bg-orange-100 focus:outline-none"
    >
      <List className="w-7 h-7 text-orange-600" />
    </button>
  );
}

function SidebarMenuButtonWithClose({
  sectionValue,
  section,
  setSection,
  children,
  tooltip,
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarMenuButton
      isActive={section === sectionValue}
      onClick={() => {
        setSection(sectionValue);
        if (isMobile) setOpenMobile(false);
      }}
      tooltip={tooltip}
    >
      {children}
    </SidebarMenuButton>
  );
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersWeek, setOrdersWeek] = useState<Order[]>([]);
  const [ordersMonth, setOrdersMonth] = useState<Order[]>([]);
  const [section, setSection] = useState<AdminSection>("pedidos");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [statsFilter, setStatsFilter] = useState<"dia" | "semana" | "mes">(
    "dia"
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
      fetchOrdersWeek();
      fetchOrdersMonth();
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

  const fetchOrdersWeek = async () => {
    try {
      const now = new Date();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
      firstDayOfWeek.setHours(0, 0, 0, 0);
      const lastDayOfWeek = new Date(now);
      lastDayOfWeek.setDate(now.getDate() + (6 - now.getDay())); // Sábado
      lastDayOfWeek.setHours(23, 59, 59, 999);
      const { data, error } = await supabaseRaw
        .from("orders")
        .select("*")
        .gte("created_at", firstDayOfWeek.toISOString())
        .lte("created_at", lastDayOfWeek.toISOString())
        .order("created_at", { ascending: false });
      if (!error) setOrdersWeek(data || []);
    } catch {}
  };

  const fetchOrdersMonth = async () => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0
      );
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      const { data, error } = await supabaseRaw
        .from("orders")
        .select("*")
        .gte("created_at", firstDayOfMonth.toISOString())
        .lte("created_at", lastDayOfMonth.toISOString())
        .order("created_at", { ascending: false });
      if (!error) setOrdersMonth(data || []);
    } catch {}
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
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar className="bg-white border-r">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButtonWithClose
                  sectionValue="pedidos"
                  section={section}
                  setSection={setSection}
                  tooltip="Pedidos"
                >
                  <List className="mr-2" /> Pedidos
                </SidebarMenuButtonWithClose>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButtonWithClose
                  sectionValue="adicionar"
                  section={section}
                  setSection={setSection}
                  tooltip="Adicionar Produto"
                >
                  <PlusCircle className="mr-2" /> Adicionar Produto
                </SidebarMenuButtonWithClose>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButtonWithClose
                  sectionValue="ajustes"
                  section={section}
                  setSection={setSection}
                  tooltip="Ajuste de Produtos"
                >
                  <Edit className="mr-2" /> Ajuste de Produtos
                </SidebarMenuButtonWithClose>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButtonWithClose
                  sectionValue="estatisticas"
                  section={section}
                  setSection={setSection}
                  tooltip="Estatísticas"
                >
                  <BarChart2 className="mr-2" /> Estatísticas
                </SidebarMenuButtonWithClose>
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
          <header className="bg-white shadow-sm border-b w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 w-full">
              <div className="flex items-center gap-4">
                <SidebarMenuButtonIcon />
                <h1 className="text-2xl font-bold text-orange-600">
                  Nildo Burguer
                </h1>
              </div>
            </div>
          </header>
          <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
            {section === "adicionar" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <ProductForm onProductAdded={fetchProducts} />
                </div>
                <div>
                  <ProductList
                    products={products}
                    onProductDeleted={fetchProducts}
                    showAvailabilityToggle={false}
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
            {section === "ajustes" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-orange-700">
                  Ajuste de Produtos
                </h2>
                <ProductList
                  products={products}
                  onProductDeleted={fetchProducts}
                />
              </div>
            )}
            {section === "estatisticas" && (
              <div className="space-y-8">
                <div className="flex gap-2 mb-4">
                  <button
                    className={`px-4 py-2 rounded font-semibold border transition-colors ${
                      statsFilter === "dia"
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-white text-orange-600 border-orange-300 hover:bg-orange-50"
                    }`}
                    onClick={() => {
                      setStatsFilter("dia");
                    }}
                  >
                    Dia
                  </button>
                  <button
                    className={`px-4 py-2 rounded font-semibold border transition-colors ${
                      statsFilter === "semana"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                    }`}
                    onClick={() => {
                      setStatsFilter("semana");
                    }}
                  >
                    Semana
                  </button>
                  <button
                    className={`px-4 py-2 rounded font-semibold border transition-colors ${
                      statsFilter === "mes"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-green-600 border-green-300 hover:bg-green-50"
                    }`}
                    onClick={() => {
                      setStatsFilter("mes");
                    }}
                  >
                    Mês
                  </button>
                </div>
                {statsFilter === "dia" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-orange-700">
                      Estatísticas dos Pedidos do Dia
                    </h2>
                    {orders.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">
                        <p className="text-lg">Nenhum pedido realizado hoje.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white rounded-lg shadow border p-4"
                          >
                            <div className="font-bold text-lg mb-1">
                              {order.customer_name}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {order.customer_phone}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Produtos:</span>
                              <ul className="ml-2 list-disc text-sm">
                                {(order.order_items as OrderItem[]).map(
                                  (item, idx) => (
                                    <li
                                      key={idx}
                                      className="flex justify-between"
                                    >
                                      <span>
                                        {item.quantity}x {item.name}
                                      </span>
                                      <span className="font-semibold ml-2">
                                        R${" "}
                                        {(item.price * item.quantity).toFixed(
                                          2
                                        )}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                            <div className="font-bold text-orange-700 mt-2">
                              Total: R$ {Number(order.total_value).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {statsFilter === "semana" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-blue-700">
                      Estatísticas dos Pedidos da Semana
                    </h2>
                    {ordersWeek.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">
                        <p className="text-lg">
                          Nenhum pedido realizado nesta semana.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ordersWeek.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white rounded-lg shadow border p-4"
                          >
                            <div className="font-bold text-lg mb-1">
                              {order.customer_name}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {order.customer_phone}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Produtos:</span>
                              <ul className="ml-2 list-disc text-sm">
                                {(order.order_items as OrderItem[]).map(
                                  (item, idx) => (
                                    <li
                                      key={idx}
                                      className="flex justify-between"
                                    >
                                      <span>
                                        {item.quantity}x {item.name}
                                      </span>
                                      <span className="font-semibold ml-2">
                                        R${" "}
                                        {(item.price * item.quantity).toFixed(
                                          2
                                        )}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                            <div className="font-bold text-blue-700 mt-2">
                              Total: R$ {Number(order.total_value).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {statsFilter === "mes" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-green-700">
                      Estatísticas dos Pedidos do Mês
                    </h2>
                    {ordersMonth.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">
                        <p className="text-lg">
                          Nenhum pedido realizado neste mês.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ordersMonth.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white rounded-lg shadow border p-4"
                          >
                            <div className="font-bold text-lg mb-1">
                              {order.customer_name}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {order.customer_phone}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Produtos:</span>
                              <ul className="ml-2 list-disc text-sm">
                                {(order.order_items as OrderItem[]).map(
                                  (item, idx) => (
                                    <li
                                      key={idx}
                                      className="flex justify-between"
                                    >
                                      <span>
                                        {item.quantity}x {item.name}
                                      </span>
                                      <span className="font-semibold ml-2">
                                        R${" "}
                                        {(item.price * item.quantity).toFixed(
                                          2
                                        )}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                            <div className="font-bold text-green-700 mt-2">
                              Total: R$ {Number(order.total_value).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
