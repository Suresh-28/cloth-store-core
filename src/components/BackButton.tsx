import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
  to?: string;
}

const BackButton = ({ className = "", to }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show back button on home page
  if (location.pathname === '/') {
    return null;
  }

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`flex items-center space-x-2 text-gray-600 hover:text-gray-900 ${className}`}
    >
      <ArrowLeft size={16} />
      <span>Back</span>
    </Button>
  );
};

export default BackButton;