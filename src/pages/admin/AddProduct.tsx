
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { products, Product } from '@/data/products';
import BasicInfoForm from '@/components/admin/BasicInfoForm';
import PricingForm from '@/components/admin/PricingForm';
import ImageUploadForm from '@/components/admin/ImageUploadForm';
import SizeSelector from '@/components/admin/SizeSelector';
import ColorManager from '@/components/admin/ColorManager';
import FeatureManager from '@/components/admin/FeatureManager';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  originalPrice: z.number().optional(),
  category: z.enum(['all', 'men', 'women']),
  sizes: z.array(z.string()).min(1, 'At least one size must be selected'),
  colors: z.array(z.object({
    name: z.string().min(1, 'Color name is required'),
    value: z.string().min(1, 'Color value is required')
  })).min(1, 'At least one color must be added'),
  features: z.array(z.string()).min(1, 'At least one feature must be added'),
});

type ProductFormData = z.infer<typeof productSchema>;

const AddProduct = () => {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      category: 'all',
      sizes: [],
      colors: [{ name: 'Black', value: '#000000' }],
      features: [''],
    },
  });

  const { watch, setValue, getValues } = form;
  const watchedSizes = watch('sizes');
  const watchedColors = watch('colors');
  const watchedFeatures = watch('features');

  const handleSizeToggle = (size: string) => {
    const currentSizes = getValues('sizes');
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    setValue('sizes', newSizes);
  };

  const handleColorAdd = () => {
    const currentColors = getValues('colors');
    setValue('colors', [...currentColors, { name: '', value: '#000000' }]);
  };

  const handleColorRemove = (index: number) => {
    const currentColors = getValues('colors');
    if (currentColors.length > 1) {
      setValue('colors', currentColors.filter((_, i) => i !== index));
    }
  };

  const handleColorChange = (index: number, field: 'name' | 'value', value: string) => {
    const currentColors = getValues('colors');
    const newColors = currentColors.map((color, i) => {
      if (i === index) {
        return {
          name: field === 'name' ? value : color.name,
          value: field === 'value' ? value : color.value
        };
      }
      return {
        name: color.name,
        value: color.value
      };
    });
    setValue('colors', newColors);
  };

  const handleFeatureAdd = () => {
    const currentFeatures = getValues('features');
    setValue('features', [...currentFeatures, '']);
  };

  const handleFeatureRemove = (index: number) => {
    const currentFeatures = getValues('features');
    if (currentFeatures.length > 1) {
      setValue('features', currentFeatures.filter((_, i) => i !== index));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const currentFeatures = getValues('features');
    const newFeatures = [...currentFeatures];
    newFeatures[index] = value;
    setValue('features', newFeatures);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new product object
      const newProduct: Product = {
        id: (products.length + 1).toString(),
        name: data.name,
        price: data.price,
        originalPrice: data.originalPrice,
        discount: data.originalPrice ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100) : undefined,
        image: uploadedImages.length > 0 ? URL.createObjectURL(uploadedImages[0]) : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
        images: uploadedImages.length > 0 ? uploadedImages.map(file => URL.createObjectURL(file)) : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'],
        rating: 0,
        reviewCount: 0,
        colors: data.colors,
        sizes: data.sizes,
        description: data.description,
        features: data.features.filter(feature => feature.trim() !== ''),
        category: data.category,
        isNew: true,
      };

      // In a real app, you would send this to your backend
      console.log('New product created:', newProduct);
      
      toast({ 
        title: "Success!", 
        description: "Product has been added successfully." 
      });
      
      navigate('/admin/products');
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin/products" className="flex items-center space-x-2 hover:text-gray-600">
                <ArrowLeft size={20} />
                <span>Back to Products</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BasicInfoForm control={form.control} />
              <PricingForm control={form.control} />
            </div>

            <ImageUploadForm 
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
            />

            <SizeSelector 
              watchedSizes={watchedSizes}
              onSizeToggle={handleSizeToggle}
              error={form.formState.errors.sizes?.message}
            />

            <ColorManager 
              colors={watchedColors}
              onColorAdd={handleColorAdd}
              onColorRemove={handleColorRemove}
              onColorChange={handleColorChange}
              error={form.formState.errors.colors?.message}
            />

            <FeatureManager 
              features={watchedFeatures}
              onFeatureAdd={handleFeatureAdd}
              onFeatureRemove={handleFeatureRemove}
              onFeatureChange={handleFeatureChange}
              error={form.formState.errors.features?.message}
            />

            <div className="flex justify-end space-x-4">
              <Link to="/admin/products">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="bg-black hover:bg-gray-800 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Product...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddProduct;
