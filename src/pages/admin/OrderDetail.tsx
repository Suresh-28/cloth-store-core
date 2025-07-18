import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useOrders, Order } from '@/contexts/OrdersContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const OrderDetail = () => {
  const { id } = useParams();
  const { orders, updateOrderStatus } = useOrders();
  const { toast } = useToast();

  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <Link to="/admin/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const downloadInvoice = () => {
    const pdf = new jsPDF();
    
    // Set up the PDF document
    pdf.setFontSize(20);
    pdf.text('INVOICE', 20, 30);
    
    // Company info
    pdf.setFontSize(16);
    pdf.text('Loom & Co.', 20, 50);
    pdf.setFontSize(10);
    pdf.text('Fashion Clothing Store', 20, 60);
    
    // Order details
    pdf.setFontSize(14);
    pdf.text(`Order #${order.id}`, 120, 50);
    pdf.setFontSize(10);
    pdf.text(`Date: ${new Date(order.date).toLocaleDateString('en-GB')}`, 120, 60);
    pdf.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, 120, 70);
    
    // Customer info
    pdf.setFontSize(12);
    pdf.text('Bill To:', 20, 90);
    pdf.setFontSize(10);
    pdf.text(order.customer, 20, 100);
    pdf.text(order.email, 20, 110);
    if (order.phone) {
      pdf.text(order.phone, 20, 120);
    }
    
    // Shipping address
    if (order.shippingAddress) {
      pdf.setFontSize(12);
      pdf.text('Ship To:', 120, 90);
      pdf.setFontSize(10);
      pdf.text(order.shippingAddress.address, 120, 100);
      pdf.text(`${order.shippingAddress.city} ${order.shippingAddress.postalCode}`, 120, 110);
      pdf.text(order.shippingAddress.country, 120, 120);
    }
    
    // Items table header
    let yPosition = 150;
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
    order.items.forEach((item) => {
      pdf.text(item.name.substring(0, 25), 20, yPosition);
      pdf.text(item.size, 80, yPosition);
      pdf.text(item.color, 110, yPosition);
      pdf.text(item.quantity.toString(), 140, yPosition);
      pdf.text(`£${item.price.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });
    
    // Totals
    yPosition += 10;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    if (order.subtotal) {
      pdf.text('Subtotal:', 140, yPosition);
      pdf.text(`£${order.subtotal.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    }
    
    if (order.shippingCost !== undefined) {
      pdf.text('Shipping:', 140, yPosition);
      pdf.text(`£${order.shippingCost.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    }
    
    if (order.tax) {
      pdf.text('Tax:', 140, yPosition);
      pdf.text(`£${order.tax.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    }
    
    pdf.setFontSize(12);
    pdf.text('Total:', 140, yPosition + 5);
    pdf.text(`£${order.total.toFixed(2)}`, 170, yPosition + 5);
    
    // Save the PDF
    pdf.save(`invoice-${order.id}.pdf`);
  };

  const statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: Package, completed: true },
    { status: 'processing', label: 'Processing', icon: Package, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
    { status: 'shipped', label: 'Shipped', icon: Truck, completed: ['shipped', 'delivered'].includes(order.status) },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle, completed: order.status === 'delivered' }
  ];

  const handleStatusChange = (newStatus: string) => {
    updateOrderStatus(order.id, newStatus as Order['status']);
    toast({
      title: "Order Updated",
      description: `Order status has been updated to ${newStatus}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin/orders" className="flex items-center space-x-2">
                <ArrowLeft size={20} />
                <span>Back to Orders</span>
              </Link>
            </div>
            <Button
              onClick={downloadInvoice}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Download Invoice</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-gray-600">Placed on {order.date}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order Status
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  {statusSteps.map((step, index) => (
                    <div key={step.status} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <step.icon size={16} />
                      </div>
                      <span className="text-xs mt-2 text-center">{step.label}</span>
                    </div>
                  ))}
                </div>
                {order.tracking && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="text-lg font-mono">{order.tracking}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">Size: {item.size}, Color: {item.color}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-gray-900">£{item.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-sm text-gray-600">{order.email}</p>
                    {order.phone && <p className="text-sm text-gray-600">{order.phone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.subtotal && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>£{order.subtotal}</span>
                    </div>
                  )}
                  {order.shippingCost !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>£{order.shippingCost}</span>
                    </div>
                  )}
                  {order.tax && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>£{order.tax}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>£{order.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
