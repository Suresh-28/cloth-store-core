import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, Lock } from 'lucide-react';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { useOrders, Order, OrderItem } from '@/contexts/OrdersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

const Payment = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Create order from cart items
      const orderItems: OrderItem[] = items.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price
      }));

      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString('en-GB'),
        status: 'pending',
        total: totalWithTax,
        items: orderItems,
        customer: paymentData.nameOnCard || 'Customer',
        email: 'customer@example.com',
        subtotal: getTotalPrice(),
        shippingCost: 0,
        tax: getTotalPrice() * 0.2
      };

      // Add order to context
      addOrder(newOrder);
      
      setIsProcessing(false);
      clearCart();
      toast({ title: "Payment successful!", description: "Your order has been placed." });
      navigate('/orders');
    }, 2000);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const totalWithTax = getTotalPrice() * 1.2;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="text-green-600" size={20} />
                <span className="text-sm font-medium text-gray-900">Secure Payment</span>
              </div>
              <p className="text-sm text-gray-600">
                Your payment information is encrypted and secure.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nameOnCard">Name on Card</Label>
                <Input
                  id="nameOnCard"
                  name="nameOnCard"
                  required
                  value={paymentData.nameOnCard}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative mt-1">
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    required
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                  <CreditCard className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    required
                    value={paymentData.expiryDate}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative mt-1">
                    <Input
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      required
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-black hover:bg-gray-800 text-white py-3"
              >
                {isProcessing ? 'Processing...' : `Pay £${totalWithTax.toFixed(2)}`}
              </Button>
            </form>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 h-fit">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex space-x-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-600">Size: {item.size}, Color: {item.color}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">
                    £{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">£{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">£{(getTotalPrice() * 0.2).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-lg font-medium">Total</span>
                <span className="text-lg font-medium">£{totalWithTax.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
