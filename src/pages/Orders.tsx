import { useState } from 'react';
import { Package, Clock, CheckCircle, Truck, Search, Download } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/contexts/OrdersContext';
import jsPDF from 'jspdf';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  customer: string;
  email: string;
  phone?: string;
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
}

const Orders = () => {
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  console.log('Orders page - Current orders:', orders);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => 
    (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (selectedStatus === 'all' || order.status === selectedStatus)
  );

  const downloadInvoice = (order: Order) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing': return <Package className="w-4 h-4 text-blue-600" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <Clock className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'processing': return 50;
      case 'shipped': return 75;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const getTrackingSteps = (status: string) => {
    const steps = [
      { label: 'Order Placed', status: 'pending', completed: true },
      { label: 'Processing', status: 'processing', completed: ['processing', 'shipped', 'delivered'].includes(status) },
      { label: 'Shipped', status: 'shipped', completed: ['shipped', 'delivered'].includes(status) },
      { label: 'Delivered', status: 'delivered', completed: status === 'delivered' }
    ];
    return steps;
  };

  const getOrderSummary = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    
    return { total, pending, processing, shipped, delivered };
  };

  const summary = getOrderSummary();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-4">Your Orders</h1>
          
          {/* Order Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-semibold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-semibold text-yellow-600">{summary.pending}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-semibold text-blue-600">{summary.processing}</div>
              <div className="text-sm text-blue-600">Processing</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-semibold text-purple-600">{summary.shipped}</div>
              <div className="text-sm text-purple-600">Shipped</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-semibold text-green-600">{summary.delivered}</div>
              <div className="text-sm text-green-600">Delivered</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID, customer, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus !== 'all' ? 'No matching orders' : 'No orders yet'}
            </h2>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'When you place an order, it will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium">Order #{order.id}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on {new Date(order.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                    </div>
                    <div className="text-right flex flex-col items-end space-y-2">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">£{order.total.toFixed(2)}</p>
                      <Button
                        onClick={() => downloadInvoice(order)}
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-1"
                      >
                        <Download size={14} />
                        <span>Invoice</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Track Status Section */}
                  {order.status !== 'cancelled' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Track Your Order</h3>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <Progress value={getStatusProgress(order.status)} className="h-2" />
                        <p className="text-sm text-gray-600 mt-2">{getStatusProgress(order.status)}% Complete</p>
                      </div>

                      {/* Tracking Steps */}
                      <div className="flex justify-between items-center">
                        {getTrackingSteps(order.status).map((step, index) => (
                          <div key={index} className="flex flex-col items-center text-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                              step.completed 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {step.completed ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Clock className="w-4 h-4" />
                              )}
                            </div>
                            <span className={`text-xs font-medium ${
                              step.completed ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Order Items ({order.items.length})</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border">
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
                        <div className="text-right">
                          <p className="font-medium text-gray-900">£{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total</span>
                      <span className="text-lg font-medium text-gray-900">£{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
