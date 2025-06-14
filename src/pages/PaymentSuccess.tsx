
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { useOrders } from '@/contexts/OrdersContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orders } = useOrders();
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    // Get the most recent order (assuming it's the one just created)
    if (orders.length > 0) {
      const latestOrder = orders[0];
      setCurrentOrder(latestOrder);
    }
  }, [orders]);

  const downloadInvoice = () => {
    if (!currentOrder) return;

    const pdf = new jsPDF();
    
    // Set up the PDF document
    pdf.setFontSize(20);
    pdf.text('INVOICE', 20, 30);
    
    // Company info
    pdf.setFontSize(16);
    pdf.text('Loom & Co.', 20, 50);
    pdf.setFontSize(10);
    pdf.text('Fashion Clothing Store', 20, 60);
    pdf.text('Thank you for your purchase!', 20, 70);
    
    // Order details
    pdf.setFontSize(14);
    pdf.text(`Order #${currentOrder.id}`, 120, 50);
    pdf.setFontSize(10);
    pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 120, 60);
    pdf.text(`Status: ${currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}`, 120, 70);
    
    // Customer info
    pdf.setFontSize(12);
    pdf.text('Bill To:', 20, 90);
    pdf.setFontSize(10);
    pdf.text(currentOrder.customer, 20, 100);
    pdf.text(currentOrder.email, 20, 110);
    
    // Items table header
    let yPosition = 140;
    pdf.setFontSize(10);
    pdf.text('Item', 20, yPosition);
    pdf.text('Size', 80, yPosition);
    pdf.text('Color', 110, yPosition);
    pdf.text('Qty', 140, yPosition);
    pdf.text('Price', 170, yPosition);
    
    // Draw line under header
    pdf.line(20, yPosition + 5, 190, yPosition + 5);
    yPosition += 15;
    
    // Items
    currentOrder.items.forEach((item) => {
      pdf.text(item.name.substring(0, 25), 20, yPosition);
      pdf.text(item.size, 80, yPosition);
      pdf.text(item.color, 110, yPosition);
      pdf.text(item.quantity.toString(), 140, yPosition);
      pdf.text(`£${(item.price * item.quantity).toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });
    
    // Totals
    yPosition += 10;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    if (currentOrder.subtotal) {
      pdf.text('Subtotal:', 140, yPosition);
      pdf.text(`£${currentOrder.subtotal.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    }
    
    if (currentOrder.tax) {
      pdf.text('Tax:', 140, yPosition);
      pdf.text(`£${currentOrder.tax.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    }
    
    pdf.setFontSize(12);
    pdf.text('Total:', 140, yPosition + 5);
    pdf.text(`£${currentOrder.total.toFixed(2)}`, 170, yPosition + 5);
    
    // Save the PDF
    pdf.save(`invoice-${currentOrder.id}.pdf`);
    
    toast({
      title: "Invoice downloaded!",
      description: "Your invoice has been downloaded successfully."
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {currentOrder && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Confirmation</span>
                <span className="text-lg font-medium text-green-600">
                  Order #{currentOrder.id}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span>{new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize text-green-600">{currentOrder.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span>{currentOrder.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{currentOrder.email}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
                  <div className="space-y-2 text-sm">
                    {currentOrder.subtotal && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>£{currentOrder.subtotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span>Free</span>
                    </div>
                    {currentOrder.tax && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span>£{currentOrder.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total Paid:</span>
                      <span>£{currentOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          Size: {item.size}, Color: {item.color}, Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={downloadInvoice}
                  className="flex items-center space-x-2 bg-black hover:bg-gray-800"
                >
                  <Download size={16} />
                  <span>Download Invoice</span>
                </Button>
                
                <Button
                  onClick={() => navigate('/orders')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <span>View All Orders</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            A confirmation email has been sent to your email address.
          </p>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
