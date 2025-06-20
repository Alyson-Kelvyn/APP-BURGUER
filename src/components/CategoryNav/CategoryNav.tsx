import React from "react";
import { Button } from "@/components/ui/button";
import {
  Pizza,
  Sandwich,
  GlassWater,
  Coffee,
  Cookie,
  UtensilsCrossed,
} from "lucide-react";

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "hambúrguers":
      return <Sandwich className="h-5 w-5" />;
    case "pizzas":
      return <Pizza className="h-5 w-5" />;
    case "bebidas":
      return <GlassWater className="h-5 w-5" />;
    case "pastéis":
      return <Coffee className="h-5 w-5" />;
    case "sobremesas":
      return <Cookie className="h-5 w-5" />;
    default:
      return <UtensilsCrossed className="h-5 w-5" />;
  }
};

export const CategoryNav = ({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryNavProps) => {
  return (
    <section className="py-8 bg-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Escolha sua Categoria
          </h3>
          <p className="text-gray-600">
            Navegue pelos nossos deliciosos produtos
          </p>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-4 px-1 sm:justify-center sm:flex-wrap sm:overflow-visible">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-orange-50 hover:border-orange-300"
              }`}
              onClick={() => onCategorySelect(category)}
            >
              {getCategoryIcon(category)}
              {category}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};
