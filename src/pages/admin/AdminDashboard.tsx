
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Package, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import StatsCards from '@/components/admin/StatsCards';
import RecentActivity from '@/components/admin/RecentActivity';

const AdminDashboard = () => {
  const { stats, recentActivity, loading } = useAdminDashboard();

  const quickActions = [
    { title: 'Add Product', href: '/admin/products/add', icon: Package },
    { title: 'View Orders', href: '/admin/orders', icon: ShoppingBag },
    { title: 'Manage Users', href: '/admin/users', icon: Users },
    { title: 'Send Notification', href: '/admin/notifications', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <span className="text-xl font-medium text-gray-900">Loom & Co.</span>
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-lg font-medium text-gray-900">Admin Dashboard</span>
            </div>
            <Link to="/">
              <Button variant="outline">View Store</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <StatsCards stats={stats} loading={loading} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <action.icon className="h-8 w-8 text-gray-600 mb-3" />
                  <span className="font-medium text-gray-900">{action.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} loading={loading} />
      </div>
    </div>
  );
};

export default AdminDashboard;
