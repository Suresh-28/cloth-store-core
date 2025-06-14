
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bell, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  target: string;
  recipients: string[] | null;
  status: string;
  created_at: string;
}

const AdminNotifications = () => {
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    target: 'all', // 'all' or 'specific'
    recipients: ''
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for notifications
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          console.log('Notifications updated, refetching data...');
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNotificationData({
      ...notificationData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const recipientsArray = notificationData.target === 'specific' 
        ? notificationData.recipients.split(',').map(email => email.trim()).filter(email => email)
        : null;

      const { error } = await supabase
        .from('notifications')
        .insert({
          title: notificationData.title,
          message: notificationData.message,
          target: notificationData.target,
          recipients: recipientsArray,
          status: 'sent'
        });

      if (error) {
        console.error('Error sending notification:', error);
        toast({ 
          title: "Error", 
          description: "Failed to send notification. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({ 
        title: "Notification sent!", 
        description: `Notification sent to ${notificationData.target === 'all' ? 'all users' : 'selected users'}`
      });
      
      // Reset form
      setNotificationData({
        title: '',
        message: '',
        target: 'all',
        recipients: ''
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({ 
        title: "Error", 
        description: "Failed to send notification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTargetDisplay = (notification: Notification) => {
    if (notification.target === 'all') {
      return 'All Users';
    } else if (notification.recipients && notification.recipients.length > 0) {
      return notification.recipients.length === 1 
        ? notification.recipients[0] 
        : `${notification.recipients.length} recipients`;
    }
    return 'Specific Users';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <span className="text-xl font-medium text-gray-900">Loom & Co.</span>
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-lg font-medium text-gray-900">Notifications</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Notification Form */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Send Notification</h1>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell size={20} />
                  <span>Create New Notification</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Notification Title</Label>
                    <Input
                      id="title"
                      name="title"
                      required
                      value={notificationData.title}
                      onChange={handleInputChange}
                      placeholder="Enter notification title"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={notificationData.message}
                      onChange={handleInputChange}
                      placeholder="Enter your message"
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="target">Target Audience</Label>
                    <select
                      id="target"
                      name="target"
                      value={notificationData.target}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="all">All Users</option>
                      <option value="specific">Specific Users</option>
                    </select>
                  </div>

                  {notificationData.target === 'specific' && (
                    <div>
                      <Label htmlFor="recipients">Recipients (Email addresses, comma separated)</Label>
                      <Textarea
                        id="recipients"
                        name="recipients"
                        value={notificationData.recipients}
                        onChange={handleInputChange}
                        placeholder="user1@example.com, user2@example.com"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-black hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
                  >
                    <Send size={16} />
                    <span>{sending ? 'Sending...' : 'Send Notification'}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12"
                    onClick={() => setNotificationData({
                      ...notificationData,
                      title: 'New Product Alert',
                      message: 'Check out our latest arrivals!',
                      target: 'all'
                    })}
                  >
                    <Bell size={16} />
                    <span>Product Alert</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12"
                    onClick={() => setNotificationData({
                      ...notificationData,
                      title: 'Flash Sale',
                      message: 'Limited time offer - 20% off everything!',
                      target: 'all'
                    })}
                  >
                    <Bell size={16} />
                    <span>Sale Alert</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notifications */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Notifications</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.status === 'sent' 
                            ? 'bg-green-100 text-green-800'
                            : notification.status === 'delivered'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          {notification.target === 'all' ? (
                            <Users size={14} />
                          ) : (
                            <User size={14} />
                          )}
                          <span>{getTargetDisplay(notification)}</span>
                        </div>
                        <span>{formatDate(notification.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No notifications sent yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
