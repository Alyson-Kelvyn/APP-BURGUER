import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Settings, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/Cart/CartDrawer";
import { CategoryNav } from "@/components/CategoryNav/CategoryNav";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart, getTotalItems, items, updateQuantity } = useCart();
  const [observacoes, setObservacoes] = useState<{
    [productId: string]: string;
  }>({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

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
        description: "Não foi possível carregar o cardápio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .order("category", { ascending: true });

      if (error) {
        console.error("Erro ao carregar categorias:", error);
      } else {
        const uniqueCategories = Array.from(
          new Set(data?.map((item) => item.category) || [])
        );
        setCategories(["Todos", ...uniqueCategories]);
      }
    } catch (error) {
      console.error("Erro inesperado ao carregar categorias:", error);
    }
  };

  const filteredProducts =
    selectedCategory === "Todos"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const handleAdminAccess = () => {
    navigate("/admin");
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, observacoes[product.id] || "");
    setObservacoes((prev) => ({ ...prev, [product.id]: "" }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando cardápio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-orange-600">
                Nildo Burguer
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleAdminAccess}
                className="text-gray-600 hover:text-orange-600"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <CartDrawer>
                <Button className="bg-orange-600 hover:bg-orange-700 relative">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Carrinho
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </CartDrawer>
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Menu Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {selectedCategory === "Todos"
                  ? "Nenhum produto disponível no momento."
                  : `Nenhum produto encontrado na categoria ${selectedCategory}.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow p-2 sm:p-0"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-41 sm:h-48 object-cover"
                    />
                  </div>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h4 className="text-base sm:text-xl font-semibold text-gray-900">
                        {product.name}
                      </h4>
                      <span className="text-[10px] sm:text-xs bg-orange-100 text-orange-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
                      {product.description}
                    </p>
                    <input
                      type="text"
                      className="w-full text-[10px] sm:text-xs border rounded px-1 py-0.5 mb-2"
                      placeholder="Observação (ex: sem cebola, ponto da carne...)"
                      value={observacoes[product.id] || ""}
                      onChange={(e) =>
                        setObservacoes((prev) => ({
                          ...prev,
                          [product.id]: e.target.value,
                        }))
                      }
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-lg sm:text-2xl font-bold text-orange-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Adicionar
                          {(() => {
                            const cartItem = items.find(
                              (item) => item.id === product.id
                            );
                            return cartItem && cartItem.quantity > 0 ? (
                              <span className="ml-2 bg-white text-orange-600 rounded-full px-2 py-0.5 text-xs font-bold border border-orange-600">
                                {cartItem.quantity}
                              </span>
                            ) : null;
                          })()}
                        </Button>
                        {(() => {
                          const cartItem = items.find(
                            (item) => item.id === product.id
                          );
                          return cartItem && cartItem.quantity > 0 ? (
                            <Button
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700"
                              onClick={() =>
                                updateQuantity(
                                  product.id,
                                  cartItem.quantity - 1
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4">Burger House</h5>
              <p className="text-gray-400">
                Os melhores sabores da cidade, feitos com amor e ingredientes
                frescos.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Contato</h5>
              <p className="text-gray-400">📞 (11) 9999-9999</p>
              <p className="text-gray-400">📧 contato@burgerhouse.com</p>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Horário</h5>
              <p className="text-gray-400">Segunda a Domingo</p>
              <p className="text-gray-400">18h às 23h</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © 2024 Burger House. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
