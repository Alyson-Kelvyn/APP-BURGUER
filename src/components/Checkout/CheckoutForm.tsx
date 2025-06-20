
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';

interface CheckoutFormProps {
  onBack: () => void;
}

export function CheckoutForm({ onBack }: CheckoutFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [changeFor, setChangeFor] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCart();

  const formatOrderForWhatsApp = () => {
    let message = `🍔 *NOVO PEDIDO - BURGER HOUSE* 🍔\n\n`;
    message += `👤 *Cliente:* ${name}\n`;
    message += `📱 *Telefone:* ${phone}\n`;
    message += `📍 *Endereço:* ${street}, ${number} - ${neighborhood}\n\n`;
    
    message += `🛍️ *ITENS DO PEDIDO:*\n`;
    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 *TOTAL: R$ ${getTotalPrice().toFixed(2)}*\n\n`;
    message += `💳 *Forma de Pagamento:* ${paymentMethod}\n`;
    
    if (paymentMethod === 'Dinheiro' && changeFor) {
      message += `💵 *Troco para:* R$ ${changeFor}\n`;
    }
    
    return encodeURIComponent(message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const whatsappMessage = formatOrderForWhatsApp();
      const whatsappUrl = `https://wa.me/5585994015283?text=${whatsappMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Pedido enviado!",
        description: "Seu pedido foi enviado pelo WhatsApp. Aguarde o contato do restaurante.",
      });
      
      clearCart();
      onBack();
    } catch (error) {
      toast({
        title: "Erro ao enviar pedido",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <h2 className="text-lg font-semibold">Finalizar Pedido</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(85) 99999-9999"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">Rua</Label>
          <Input
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Nome da rua"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Número da casa/apt"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Nome do bairro"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment">Forma de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
              <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
              <SelectItem value="PIX">PIX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === 'Dinheiro' && (
          <div className="space-y-2">
            <Label htmlFor="change">Troco para quanto?</Label>
            <Input
              id="change"
              type="number"
              step="0.01"
              value={changeFor}
              onChange={(e) => setChangeFor(e.target.value)}
              placeholder="Ex: 50.00"
              required
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total:</span>
            <span className="text-orange-600">R$ {getTotalPrice().toFixed(2)}</span>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700" 
            size="lg"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Pedido via WhatsApp"}
          </Button>
        </div>
      </form>
    </div>
  );
}
