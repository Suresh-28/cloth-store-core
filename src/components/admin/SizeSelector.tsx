
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SizeSelectorProps {
  watchedSizes: string[];
  onSizeToggle: (size: string) => void;
  error?: string;
}

const SizeSelector = ({ watchedSizes, onSizeToggle, error }: SizeSelectorProps) => {
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Sizes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <Button
              key={size}
              type="button"
              variant={watchedSizes.includes(size) ? "default" : "outline"}
              onClick={() => onSizeToggle(size)}
              className="w-12 h-12"
            >
              {size}
            </Button>
          ))}
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SizeSelector;
