
import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentTimerProps {
  onComplete: () => void;
  onCancel: () => void;
  amount: number;
  upiId: string;
}

const PaymentTimer = ({ onComplete, onCancel, amount, upiId }: PaymentTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      onCancel();
    }
  }, [timeLeft, isCompleted, onCancel]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaymentComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  if (isCompleted) {
    return (
      <div className="text-center">
        <CheckCircle className="text-green-600 mx-auto mb-4" size={64} />
        <h2 className="text-2xl font-semibold text-green-600 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Redirecting to your orders...</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="bg-blue-50 rounded-full p-4 inline-block">
        <Smartphone className="text-blue-600" size={48} />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Complete Payment on Your Phone</h2>
        <p className="text-gray-600 mb-4">
          Open your UPI app and complete the payment for £{amount.toFixed(2)}
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Clock className="text-gray-600" size={20} />
          <span className="text-xl font-mono font-semibold">
            {formatTime(timeLeft)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">Time remaining to complete payment</p>
        
        <div className="bg-white p-3 rounded border mb-4">
          <p className="text-sm font-medium text-gray-700">Pay to:</p>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{upiId}</code>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          onClick={handlePaymentComplete}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          I've Completed the Payment
        </Button>
        
        <Button 
          onClick={onCancel}
          variant="outline"
          className="w-full"
        >
          Cancel Payment
        </Button>
      </div>
    </div>
  );
};

export default PaymentTimer;
