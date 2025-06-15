
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

  // Load saved contact info on mount, but for guests defer until email is entered!
  useEffect(() => {
    loadSavedContactInfo();
  }, []);

  // Loads saved info for the current session: user or guest (if email entered)
  const loadSavedContactInfo = async (maybeEmail?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // If logged in, use user_id
      if (user) {
        // Try checkout_infos first (new way)
        const { data: checkoutInfo } = await supabase
          .from('checkout_infos')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (checkoutInfo) {
          setSavedContactInfo(prev => ({
            ...prev,
            email: checkoutInfo.email || user.email || '',
            firstName: checkoutInfo.first_name || '',
            lastName: checkoutInfo.last_name || '',
            address: checkoutInfo.address || '',
            city: checkoutInfo.city || '',
            postalCode: checkoutInfo.postal_code || '',
            country: checkoutInfo.country || 'United Kingdom',
            phone: checkoutInfo.phone || ''
          }));
          return;
        }
        // Fallback: Try to get from user profile (legacy)
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

        // Optionally get most recent shipping info from orders (fallback)
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
        return;
      }

      // Guest: try fetching checkout info by email (if provided)
      const guestEmail = maybeEmail || savedContactInfo.email;
      if (guestEmail) {
        const { data: checkoutInfo } = await supabase
          .from('checkout_infos')
          .select('*')
          .eq('email', guestEmail)
          .is('user_id', null)
          .maybeSingle();

        if (checkoutInfo) {
          setSavedContactInfo(prev => ({
            ...prev,
            email: checkoutInfo.email || '',
            firstName: checkoutInfo.first_name || '',
            lastName: checkoutInfo.last_name || '',
            address: checkoutInfo.address || '',
            city: checkoutInfo.city || '',
            postalCode: checkoutInfo.postal_code || '',
            country: checkoutInfo.country || 'United Kingdom',
            phone: checkoutInfo.phone || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error loading saved contact info:', error);
    }
  };

  // When guest enters a different email, auto-look up info and populate
  const handleGuestEmailChange = async (email: string) => {
    await loadSavedContactInfo(email);
  };

  // Save checkout info for user or guest. Does NOT block checkout if this fails.
  const saveCheckoutContactInfo = async (formData: CheckoutFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Upsert for logged in user using user_id
        await supabase
          .from('checkout_infos')
          .upsert({
            user_id: user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      } else if (formData.email) {
        // Upsert for guest by email (user_id null)
        await supabase
          .from('checkout_infos')
          .upsert({
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            updated_at: new Date().toISOString()
            // user_id omitted to ensure is null
          })
          .select()
          .single();
      }
    } catch (error) {
      // Suppress error, not critical to block checkout
      console.error('Failed to save checkout info', error);
    }
  };

  // saveCheckoutData now also upserts to checkout_infos
  const saveCheckoutData = async (formData: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      // Upsert checkout info for autofill next time
      await saveCheckoutContactInfo(formData);

      const { data: { user } } = await supabase.auth.getUser();

      // If user is logged in, update their profile too (legacy)
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
    loadSavedContactInfo,
    handleGuestEmailChange
  };
};
