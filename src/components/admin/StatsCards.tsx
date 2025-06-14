
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, Package, DollarSign, TrendingUp } from 'lucide-react';
import type { DashboardStats } from '@/hooks/useAdminDashboard';

interface StatsCardsProps {
  stats: DashboardStats;
  loading: boolean;
}

const StatsCards = ({ stats, loading }: StatsCardsProps) => {
  const statsConfig = [
    {
      title: 'Total Revenue',
      value: `£${stats.totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
      change: '+20.1%',
      icon: DollarSign
    },
    {
      title: 'Orders',
      value: stats.totalOrders.toLocaleString(),
      change: '+15.3%',
      icon: ShoppingBag
    },
    {
      title: 'Products',
      value: stats.totalProducts.toLocaleString(),
      change: '+2.5%',
      icon: Package
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: '+8.2%',
      icon: Users
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gray-200 rounded h-8 animate-pulse"></div>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                <div className="bg-gray-200 rounded h-4 w-12 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stat.change}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
