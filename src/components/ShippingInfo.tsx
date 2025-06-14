
import { X, Truck, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ShippingInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShippingInfo = ({ isOpen, onClose }: ShippingInfoProps) => {
  const shippingOptions = [
    {
      name: 'Standard Delivery',
      time: '3-5 business days',
      price: 'Free',
      icon: <Truck className="w-5 h-5 text-blue-600" />
    },
    {
      name: 'Express Delivery',
      time: '1-2 business days',
      price: '£4.99',
      icon: <Clock className="w-5 h-5 text-orange-600" />
    },
    {
      name: 'Next Day Delivery',
      time: 'Next business day',
      price: '£9.99',
      icon: <MapPin className="w-5 h-5 text-green-600" />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-medium">Shipping Information</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Delivery Options</h3>
            <div className="space-y-3">
              {shippingOptions.map((option, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {option.icon}
                    <div>
                      <p className="font-medium text-gray-900">{option.name}</p>
                      <p className="text-sm text-gray-600">{option.time}</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">{option.price}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Free standard delivery on orders over £50</li>
              <li>Orders placed before 2PM are processed same day</li>
              <li>Delivery times exclude weekends and holidays</li>
              <li>Express and Next Day delivery available Mon-Fri only</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShippingInfo;
