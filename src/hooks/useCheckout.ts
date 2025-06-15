
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useOrders, Order, OrderItem } from '@/contexts/OrdersContext';
import { toast } from '@/hooks/use-toast';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export const useCheckout = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedContactInfo, setSavedContactInfo] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom',
    phone: ''
  });
  const { items, getTotalPrice } = useCart();
  const { addOrder } = useOrders();

  // Load saved contact information on mount
  useEffect(() => {
    loadSavedContactInfo();
  }, []);

  const loadSavedContactInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to get from user profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setSavedContactInfo(prev => ({
          ...prev,
          email: profile.email || user.email || '',
          firstName: profile.full_name?.split(' ')[0] || '',
          lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
          phone: profile.phone || ''
        }));
      }

      // Try to get the most recent order's shipping info
      const { data: recentOrder } = await supabase
        .from('orders')
        .select('shipping_address')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentOrder?.shipping_address) {
        const shippingAddr = recentOrder.shipping_address as any;
        setSavedContactInfo(prev => ({
          ...prev,
          address: shippingAddr.address || '',
          city: shippingAddr.city || '',
          postalCode: shippingAddr.postalCode || '',
          country: shippingAddr.country || 'United Kingdom'
        }));
      }

      console.log('Loaded saved contact info:', savedContactInfo);
    } catch (error) {
      console.error('Error loading saved contact info:', error);
    }
  };

  // Updated to allow guest (unauthenticated) checkout
  const saveCheckoutData = async (formData: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // If user is logged in, update their profile
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: formData.email,
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phone,
            updated_at: new Date().toISOString()
          });
      }

      // Calculate totals
      const subtotal = getTotalPrice();
      const tax = subtotal * 0.2;
      const totalWithTax = subtotal + tax;

      // Create order items
      const orderItems: OrderItem[] = items.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price
      }));

      // Create shipping address object
      const shippingAddress = {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country
      };

      // Save order to Supabase:
      // if guest, don't include user_id
      const orderInsert: any = {
        total_amount: totalWithTax,
        shipping_address: shippingAddress,
        status: 'pending',
        payment_status: 'pending'
      };
      if (user) {
        orderInsert.user_id = user.id;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsert)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        toast({
          title: "Error",
          description: "Failed to save order. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      // Save order items
      const orderItemsData = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        console.error('Error saving order items:', itemsError);
        // Still proceed
      }

      // Create local order for context (so users see their order summary)
      const newOrder: Order = {
        id: orderData.id,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'pending',
        total: totalWithTax,
        items: orderItems,
        customer: `${formData.firstName} ${formData.lastName}` || 'Guest',
        email: formData.email,
        shippingAddress: shippingAddress,
        phone: formData.phone,
        subtotal: subtotal,
        shippingCost: 0,
        tax: tax
      };

      addOrder(newOrder);

      console.log('Checkout data saved successfully:', newOrder);

      let message = `Order #${orderData.id.slice(0, 8)} has been created successfully.`;
      if (!user) {
        message += " (as guest)";
      }
      toast({
        title: "Order saved!",
        description: message
      });

      return true;
    } catch (error) {
      console.error('Error saving checkout data:', error);
      toast({
        title: "Error",
        description: "Failed to save checkout data. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    saveCheckoutData,
    isSubmitting,
    savedContactInfo,
    loadSavedContactInfo
  };
};
