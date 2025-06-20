import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { CheckoutForm } from "@/components/Checkout/CheckoutForm";

interface CartDrawerProps {
  children: React.ReactNode;
}

export const CartDrawer = ({ children }: CartDrawerProps) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    getTotalItems,
    getTotalPrice,
    clearCart,
  } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full max-w-xs sm:w-[330px] sm:max-w-full p-1.5 sm:p-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {showCheckout ? "Checkout" : `Carrinho (${getTotalItems()} itens)`}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col h-full max-h-[calc(100vh-60px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {showCheckout ? (
            <CheckoutForm onBack={handleBackToCart} />
          ) : (
            <>
              {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Seu carrinho está vazio.
                    <br />
                    Adicione alguns produtos deliciosos!
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {items.map((item) => (
                      <Card key={item.id} className="border-gray-200">
                        <CardContent className="p-2 sm:p-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full max-w-[90px] sm:w-16 h-20 sm:h-16 object-cover rounded"
                            />
                            <div className="flex-1 w-full min-w-0">
                              <h4 className="font-bold text-sm sm:text-lg break-words whitespace-normal leading-tight mb-1 truncate">
                                {item.name}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2 break-words whitespace-normal truncate">
                                {item.description}
                              </p>
                              <div className="flex flex-row items-center justify-between gap-1 sm:gap-2 mt-1">
                                <span className="font-bold text-orange-600 text-sm sm:text-lg">
                                  R$ {item.price.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 sm:h-8 sm:w-8 text-sm sm:text-base"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-7 sm:w-8 text-center text-sm sm:text-base">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 sm:h-8 sm:w-8 text-sm sm:text-base"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 sm:h-8 sm:w-8 text-sm sm:text-base text-red-600 hover:text-red-700 ml-1"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3 mt-4">
                    <div className="flex justify-between text-base sm:text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-orange-600">
                        R$ {getTotalPrice().toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700 py-2 sm:py-3 text-sm sm:text-base font-semibold"
                        size="lg"
                        onClick={handleCheckout}
                      >
                        Finalizar Pedido
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full py-2 text-sm sm:text-base"
                        onClick={clearCart}
                        size="sm"
                      >
                        Limpar Carrinho
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
