
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'product' | 'stock';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch total revenue
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered');

      const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Fetch total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Fetch total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch total customers
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalRevenue,
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      recentOrders?.forEach(order => {
        const customerName = (order.profiles as any)?.full_name || (order.profiles as any)?.email || 'Unknown Customer';
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          title: `New order #${order.id.slice(0, 8)}`,
          description: `£${Number(order.total_amount).toFixed(2)} - ${customerName}`,
          timestamp: order.created_at,
          status: order.status === 'delivered' ? 'success' : 'info'
        });
      });

      // Fetch recently updated products
      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, updated_at')
        .order('updated_at', { ascending: false })
        .limit(3);

      recentProducts?.forEach(product => {
        activities.push({
          id: `product-${product.id}`,
          type: 'product',
          title: 'Product updated',
          description: `${product.name} - Price updated`,
          timestamp: product.updated_at,
          status: 'info'
        });

        // Add low stock alerts
        if (product.stock_quantity <= 5) {
          activities.push({
            id: `stock-${product.id}`,
            type: 'stock',
            title: 'Low stock alert',
            description: `${product.name} - Only ${product.stock_quantity} left`,
            timestamp: product.updated_at,
            status: 'warning'
          });
        }
      });

      // Sort by timestamp and take the 10 most recent
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to orders changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchStats();
          fetchRecentActivity();
        }
      )
      .subscribe();

    // Subscribe to products changes
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchStats();
          fetchRecentActivity();
        }
      )
      .subscribe();

    // Subscribe to profiles changes
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchStats();
          fetchRecentActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(profilesChannel);
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchRecentActivity()]);
      setLoading(false);
    };

    loadData();
    const cleanup = setupRealtimeSubscriptions();

    return cleanup;
  }, []);

  return {
    stats,
    recentActivity,
    loading,
    refetch: () => Promise.all([fetchStats(), fetchRecentActivity()])
  };
};
