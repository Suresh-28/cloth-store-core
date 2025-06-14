
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  customer: string;
  email: string;
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  tracking?: string;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updatedOrder: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1234',
      customer: 'John Doe',
      email: 'john@example.com',
      total: 75,
      status: 'delivered',
      date: '2024-01-15',
      items: [
        {
          id: '1',
          name: 'Classic White T-Shirt',
          image: '/lovable-uploads/2d362445-d030-436f-bcfa-2c06638a9d27.png',
          size: 'M',
          color: 'White',
          quantity: 1,
          price: 75.00
        }
      ],
      phone: '+44 123 456 7890',
      shippingAddress: {
        address: '123 Main Street',
        city: 'London',
        postalCode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      tracking: 'TR123456789GB',
      subtotal: 75,
      shippingCost: 0,
      tax: 15
    },
    {
      id: '1235',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      total: 140,
      status: 'shipped',
      date: '2024-01-14',
      items: [
        {
          id: '2',
          name: 'Denim Jacket',
          image: '/placeholder.svg',
          size: 'L',
          color: 'Blue',
          quantity: 1,
          price: 85.00
        },
        {
          id: '3',
          name: 'Black Jeans',
          image: '/placeholder.svg',
          size: '32',
          color: 'Black',
          quantity: 1,
          price: 55.00
        }
      ]
    },
    {
      id: '1236',
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      total: 55,
      status: 'processing',
      date: '2024-01-13',
      items: [
        {
          id: '4',
          name: 'Wool Sweater',
          image: '/placeholder.svg',
          size: 'M',
          color: 'Gray',
          quantity: 1,
          price: 117.00
        }
      ]
    },
    {
      id: '1237',
      customer: 'Sarah Wilson',
      email: 'sarah@example.com',
      total: 117,
      status: 'pending',
      date: '2024-01-12',
      items: [
        {
          id: '5',
          name: 'Premium Cotton Tee',
          image: '/placeholder.svg',
          size: 'S',
          color: 'Navy',
          quantity: 1,
          price: 95.00
        }
      ]
    }
  ]);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrder = (id: string, updatedOrder: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, ...updatedOrder } : order
    ));
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status } : order
    ));
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      addOrder,
      updateOrder,
      updateOrderStatus
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
