
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Color {
  name: string;
  value: string;
}

interface ColorManagerProps {
  colors: Color[];
  onColorAdd: () => void;
  onColorRemove: (index: number) => void;
  onColorChange: (index: number, field: 'name' | 'value', value: string) => void;
  error?: string;
}

const ColorManager = ({ colors, onColorAdd, onColorRemove, onColorChange, error }: ColorManagerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {colors.map((color, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Color name"
                value={color.name}
                onChange={(e) => onColorChange(index, 'name', e.target.value)}
              />
            </div>
            <input
              type="color"
              value={color.value}
              onChange={(e) => onColorChange(index, 'value', e.target.value)}
              className="w-12 h-10 rounded-md border border-gray-300"
            />
            {colors.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onColorRemove(index)}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={onColorAdd}>
          <Plus size={16} className="mr-2" />
          Add Color
        </Button>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorManager;
