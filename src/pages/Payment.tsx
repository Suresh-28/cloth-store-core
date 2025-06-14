
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, Copy, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { useOrders, Order, OrderItem } from '@/contexts/OrdersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';

const Payment = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUPI, setSelectedUPI] = useState('');
  const [customUPI, setCustomUPI] = useState('');
  const [paymentData, setPaymentData] = useState({
    nameOnPayment: '',
    email: 'customer@example.com'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const upiOptions = [
    { id: 'gpay', name: 'Google Pay', icon: '🌈' },
    { id: 'phonepe', name: 'PhonePe', icon: '💜' },
    { id: 'paytm', name: 'Paytm', icon: '💙' },
    { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳' },
    { id: 'custom', name: 'Other UPI ID', icon: '📱' }
  ];

  const totalWithTax = getTotalPrice() * 1.2;
  const upiId = "merchant@upi"; // Replace with actual merchant UPI ID
  
  const generateUPILink = () => {
    const amount = totalWithTax.toFixed(2);
    const note = `Payment for Order`;
    return `upi://pay?pa=${upiId}&am=${amount}&cu=GBP&tn=${encodeURIComponent(note)}`;
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(upiId);
    toast({
      title: "UPI ID Copied!",
      description: "UPI ID has been copied to clipboard"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUPI) {
      toast({
        title: "Please select a UPI option",
        variant: "destructive"
      });
      return;
    }

    if (selectedUPI === 'custom' && !customUPI) {
      toast({
        title: "Please enter your UPI ID",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate UPI payment processing
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

      const subtotal = getTotalPrice();
      const tax = subtotal * 0.2;
      const totalWithTax = subtotal + tax;

      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString('en-GB'),
        status: 'pending',
        total: totalWithTax,
        items: orderItems,
        customer: paymentData.nameOnPayment || 'Customer',
        email: paymentData.email,
        subtotal: subtotal,
        shippingCost: 0,
        tax: tax
      };

      console.log('UPI Payment - Creating new order:', newOrder);
      
      // Add order to context
      addOrder(newOrder);
      
      setIsProcessing(false);
      clearCart();
      
      toast({ 
        title: "Payment successful!", 
        description: `Order #${newOrder.id} has been placed successfully via UPI.` 
      });
      
      navigate('/orders');
    }, 3000);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

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
                <span className="text-sm font-medium text-gray-900">Secure UPI Payment</span>
              </div>
              <p className="text-sm text-gray-600">
                Pay securely using UPI. Your payment information is encrypted and protected.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nameOnPayment">Name</Label>
                <Input
                  id="nameOnPayment"
                  name="nameOnPayment"
                  required
                  value={paymentData.nameOnPayment}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={paymentData.email}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Choose UPI Payment Method</Label>
                <RadioGroup value={selectedUPI} onValueChange={setSelectedUPI} className="space-y-3">
                  {upiOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <label htmlFor={option.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                        <span className="text-2xl">{option.icon}</span>
                        <span className="font-medium">{option.name}</span>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {selectedUPI === 'custom' && (
                <div>
                  <Label htmlFor="customUPI">Enter your UPI ID</Label>
                  <Input
                    id="customUPI"
                    name="customUPI"
                    placeholder="yourname@upi"
                    value={customUPI}
                    onChange={(e) => setCustomUPI(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {selectedUPI && selectedUPI !== 'custom' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Smartphone className="text-blue-600" size={20} />
                    <span className="font-medium text-blue-800">Payment Instructions</span>
                  </div>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>1. Click "Pay Now" to open your {upiOptions.find(opt => opt.id === selectedUPI)?.name} app</p>
                    <p>2. Verify the payment amount: £{totalWithTax.toFixed(2)}</p>
                    <p>3. Complete the payment using your UPI PIN</p>
                  </div>
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Merchant UPI ID:</span>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{upiId}</code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyUPIId}
                          className="h-6 w-6 p-0"
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isProcessing || !selectedUPI}
                className="w-full bg-black hover:bg-gray-800 text-white py-3"
                onClick={() => {
                  if (selectedUPI && selectedUPI !== 'custom') {
                    window.open(generateUPILink(), '_blank');
                  }
                }}
              >
                {isProcessing ? 'Processing Payment...' : `Pay £${totalWithTax.toFixed(2)} via UPI`}
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
