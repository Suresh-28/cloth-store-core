
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureManagerProps {
  features: string[];
  onFeatureAdd: () => void;
  onFeatureRemove: (index: number) => void;
  onFeatureChange: (index: number, value: string) => void;
  error?: string;
}

const FeatureManager = ({ features, onFeatureAdd, onFeatureRemove, onFeatureChange, error }: FeatureManagerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Input
              placeholder="Enter feature"
              value={feature}
              onChange={(e) => onFeatureChange(index, e.target.value)}
              className="flex-1"
            />
            {features.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onFeatureRemove(index)}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={onFeatureAdd}>
          <Plus size={16} className="mr-2" />
          Add Feature
        </Button>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureManager;
