
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ShoppingBag } from 'lucide-react';

interface AuthPromptProps {
  action: string;
  onClose?: () => void;
}

const AuthPrompt = ({ action, onClose }: AuthPromptProps) => {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-600" />
        </div>
        <CardTitle className="text-xl">Sign In Required</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          Please sign in to {action} items to your account.
        </p>
        <div className="space-y-2">
          <Link to="/auth" className="block">
            <Button className="w-full bg-black hover:bg-gray-800 text-white">
              Sign In / Sign Up
            </Button>
          </Link>
          {onClose && (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Continue Browsing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthPrompt;
