import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { products, Product } from '@/data/products';

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

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
      return color;
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

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter product description" 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="all">All</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (£)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (£) - Optional</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Click to upload images or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" className="mt-4 cursor-pointer">
                        Choose Files
                      </Button>
                    </label>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sizes */}
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
                      onClick={() => handleSizeToggle(size)}
                      className="w-12 h-12"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                {form.formState.errors.sizes && (
                  <p className="text-sm text-red-500 mt-2">{form.formState.errors.sizes.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedColors.map((color, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Color name"
                        value={color.name}
                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <input
                      type="color"
                      value={color.value}
                      onChange={(e) => handleColorChange(index, 'value', e.target.value)}
                      className="w-12 h-10 rounded-md border border-gray-300"
                    />
                    {watchedColors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleColorRemove(index)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleColorAdd}>
                  <Plus size={16} className="mr-2" />
                  Add Color
                </Button>
                {form.formState.errors.colors && (
                  <p className="text-sm text-red-500">{form.formState.errors.colors.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Product Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Input
                      placeholder="Enter feature"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {watchedFeatures.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeatureRemove(index)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleFeatureAdd}>
                  <Plus size={16} className="mr-2" />
                  Add Feature
                </Button>
                {form.formState.errors.features && (
                  <p className="text-sm text-red-500">{form.formState.errors.features.message}</p>
                )}
              </CardContent>
            </Card>

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
