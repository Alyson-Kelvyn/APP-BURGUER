import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductListProps {
  products: Product[];
  onProductDeleted: () => void;
}

export function ProductList({ products, onProductDeleted }: ProductListProps) {
  const { toast } = useToast();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        toast({
          title: "Erro ao excluir produto",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Produto excluído com sucesso!",
          description: `${name} foi removido do cardápio.`,
        });
        onProductDeleted();
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Produtos Cadastrados</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {product.description}
                    </p>
                    <p className="text-lg font-bold text-orange-600">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
