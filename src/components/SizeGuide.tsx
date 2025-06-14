
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeGuide = ({ isOpen, onClose }: SizeGuideProps) => {
  const sizeChart = [
    { size: 'XS', chest: '32-34', waist: '26-28', length: '26' },
    { size: 'S', chest: '34-36', waist: '28-30', length: '27' },
    { size: 'M', chest: '36-38', waist: '30-32', length: '28' },
    { size: 'L', chest: '38-40', waist: '32-34', length: '29' },
    { size: 'XL', chest: '40-42', waist: '34-36', length: '30' },
    { size: '2XL', chest: '42-44', waist: '36-38', length: '31' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-medium">Size Guide</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">All measurements are in inches</p>
          
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chest</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waist</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sizeChart.map((row) => (
                  <tr key={row.size}>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{row.size}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{row.chest}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{row.waist}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Chest: Measure around the fullest part of your chest</p>
            <p>• Waist: Measure around your natural waistline</p>
            <p>• Length: From shoulder to hem</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeGuide;
