
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Package, Bell, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '£45,231',
      change: '+20.1%',
      icon: DollarSign
    },
    {
      title: 'Orders',
      value: '1,234',
      change: '+15.3%',
      icon: ShoppingBag
    },
    {
      title: 'Products',
      value: '56',
      change: '+2.5%',
      icon: Package
    },
    {
      title: 'Customers',
      value: '891',
      change: '+8.2%',
      icon: Users
    }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <action.icon className="h-8 w-8 text-gray-600 mb-3" />
                  <span className="font-medium text-gray-900">{action.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">New order #1234</p>
                  <p className="text-sm text-gray-600">£75.00 - Classic White T-shirt</p>
                </div>
                <span className="text-sm text-gray-500">2 min ago</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Product updated</p>
                  <p className="text-sm text-gray-600">Minimal Fashion T-shirt - Price changed</p>
                </div>
                <span className="text-sm text-gray-500">1 hour ago</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Low stock alert</p>
                  <p className="text-sm text-gray-600">Classic Black Sleeveless - Only 3 left</p>
                </div>
                <span className="text-sm text-gray-500">3 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
