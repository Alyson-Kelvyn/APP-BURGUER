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
    updateObservacao,
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
      <SheetContent className="w-full max-w-[18rem] sm:w-[300px] sm:max-w-full p-1 sm:p-3 overflow-x-hidden sheet-content-mobile-full">
        <style>{`
          @media (max-width: 640px) {
            .sheet-content-mobile-full {
              width: 100vw !important;
              max-width: 100vw !important;
              min-width: 100vw !important;
              left: 0 !important;
              right: 0 !important;
              top: 0 !important;
              height: 100vh !important;
              max-height: 100vh !important;
              border-radius: 0 !important;
              padding: 0 !important;
            }
            .cart-mobile-content {
              padding: 2.5rem 1.2rem 2.5rem 1.2rem !important;
            }
            .cart-mobile-title {
              font-size: 2.8rem !important;
              padding-top: 2.5rem !important;
              padding-bottom: 2.5rem !important;
            }
            .cart-mobile-product {
              padding: 2.5rem 1.2rem !important;
            }
            .cart-mobile-input {
              font-size: 2.5rem !important;
              padding: 5rem !important;
              min-height: 3.5rem !important;
            }
            .cart-mobile-total {
              font-size: 2.5rem !important;
              padding: 2.5rem 0 !important;
            }
            .cart-mobile-btn {
              font-size: 2.5rem !important;
              padding: 2.5rem !important;
              min-height: 4rem !important;
            }
            .cart-mobile-img {
              max-width: 180px !important;
              height: 120px !important;
            }
            .cart-mobile-product h4,
            .cart-mobile-product p {
              font-size: 2.2rem !important;
            }
          }
        `}</style>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {showCheckout ? "Checkout" : `Carrinho (${getTotalItems()} itens)`}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-2 flex flex-col h-full max-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {showCheckout ? (
            <CheckoutForm onBack={handleBackToCart} />
          ) : (
            <>
              {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Seu carrinho está vazio.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-0.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {items.map((item) => (
                      <Card
                        key={item.id}
                        className="border-gray-200 w-full max-w-full"
                      >
                        <CardContent className="p-1 sm:p-1 w-full max-w-full">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 w-full max-w-full">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full max-w-[70px] sm:w-10 h-20 sm:h-10 object-cover rounded cart-mobile-img"
                            />
                            <div className="flex-1 w-full min-w-0 max-w-full">
                              <h4 className="font-bold text-xs sm:text-base break-words whitespace-normal leading-tight mb-0.5 truncate">
                                {item.name}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-1.5 line-clamp-2 break-words whitespace-normal truncate">
                                {item.description}
                              </p>
                              <input
                                type="text"
                                className="w-full text-[10px] sm:text-xs border rounded px-1 py-0.5 mb-1 mt-1"
                                placeholder="Observação (ex: sem cebola, ponto da carne...)"
                                value={item.observacao || ""}
                                onChange={(e) =>
                                  updateObservacao(item.id, e.target.value)
                                }
                              />
                              <div className="flex flex-row items-center justify-between gap-1 sm:gap-1.5 mt-0.5">
                                <span className="font-bold text-orange-600 text-xs sm:text-base">
                                  R$ {item.price.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 sm:h-7 sm:w-7 text-xs sm:text-sm"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-6 sm:w-7 text-center text-xs sm:text-sm">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 sm:h-7 sm:w-7 text-xs sm:text-sm"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 sm:h-7 sm:w-7 text-xs sm:text-sm text-red-600 hover:text-red-700 ml-1"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="border-t pt-2 space-y-2 mt-2">
                    <div className="flex justify-between text-sm sm:text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-orange-600">
                        R$ {getTotalPrice().toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700 py-1.5 sm:py-2.5 text-xs sm:text-base font-semibold"
                        size="lg"
                        onClick={handleCheckout}
                      >
                        Finalizar Pedido
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full py-1 text-xs sm:text-base"
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
