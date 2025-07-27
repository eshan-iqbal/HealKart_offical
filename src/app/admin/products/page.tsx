'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Eye, Upload, X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Product {
  id?: string;
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images?: string[]; // optional for backward compatibility
  image?: string; // legacy single image
  category: string;
  condition: string;
  vintage: boolean;
  stock: number;
  isActive: boolean;
  rating?: number;
  reviews?: number;
  badge?: string;
}

// Helper to upload a file to Firebase Storage and return the URL
async function uploadImageToFirebase(file: File): Promise<string> {
  const storageRef = ref(storage, `product-images/${Date.now()}-${file.name}`);
  console.log('Uploading file:', file.name);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  console.log('Firebase Storage URL:', url);
  return url;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // changed from imagePreview
  const [currentImageIdx, setCurrentImageIdx] = useState<{ [productId: string]: number }>({});
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    images: [] as string[], // changed from image: ''
    category: '',
    condition: '',
    vintage: false,
    stock: '',
    isActive: true
  });

  const categories = [
    'Tops & Shirts',
    'Dresses',
    'Outerwear',
    'Bottoms',
    'Footwear',
    'Bags & Accessories',
    'Jewelry & Watches',
    'Hats & Caps',
    'Scarves & Wraps',
    'Sunglasses'
  ];

  const conditions = [
    'Excellent',
    'Good',
    'Fair',
    'Vintage'
  ];

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        // Fallback to mock data if API fails
        const mockProducts: Product[] = [
          {
            _id: '1',
            name: 'Vintage Denim Jacket',
            description: 'Classic vintage denim jacket in excellent condition',
            price: 1800,
            originalPrice: 3500,
            images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop'],
            category: 'Outerwear',
            condition: 'Excellent',
            vintage: true,
            stock: 1,
            isActive: true
          },
          {
            _id: '2',
            name: 'Retro Floral Dress',
            description: 'Beautiful vintage floral dress perfect for summer',
            price: 1200,
            originalPrice: 2500,
            images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop'],
            category: 'Dresses',
            condition: 'Good',
            vintage: true,
            stock: 1,
            isActive: true
          }
        ];
        setProducts(mockProducts);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle drag and drop for images
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        const compressedFiles = await Promise.all(files.map(file => imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        })));
        // Upload to Firebase Storage
        const urls = await Promise.all(compressedFiles.map(uploadImageToFirebase));
        console.log('All uploaded image URLs (drop):', urls);
        setImagePreviews(prev => [...prev, ...urls]);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      } else {
        toast.error('Please upload image files');
      }
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        const compressedFiles = await Promise.all(files.map(file => imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        })));
        // Upload to Firebase Storage
        const urls = await Promise.all(compressedFiles.map(uploadImageToFirebase));
        console.log('All uploaded image URLs (file input):', urls);
        setImagePreviews(prev => [...prev, ...urls]);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      } else {
        toast.error('Please upload image files');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingProduct) {
        // Update product API call
        const response = await fetch(`/api/products/${editingProduct.id || editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...formData, images: formData.images }),
        });

        if (response.ok) {
          toast.success('Product updated successfully!');
          setIsAddDialogOpen(false);
          setEditingProduct(null);
          resetForm();
          await fetchProducts();
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to update product');
        }
      } else {
        // Add product API call
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...formData, images: formData.images }),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success('Product added successfully!');
          setIsAddDialogOpen(false);
          setEditingProduct(null);
          resetForm();
          await fetchProducts();
          
          // Redirect to main page after successful addition
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to add product');
        }
      }
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      images: [],
      category: '',
      condition: '',
      vintage: false,
      stock: '',
      isActive: true
    });
    setImagePreviews([]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      category: product.category,
      condition: product.condition,
      vintage: product.vintage,
      stock: product.stock.toString(),
      isActive: product.isActive
    });
    setImagePreviews(Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []));
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setIsDeleting(productId);
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Product deleted successfully');
          await fetchProducts();
        } else {
          toast.error('Failed to delete product');
        }
      } catch (error) {
        toast.error('Failed to delete product');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Deduplicate products by id
  const uniqueProducts = Array.from(
    new Map(products.map(p => [(p.id || p._id), p])).values()
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Thrifted Products Management</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingProduct(null);
                    resetForm();
                  }} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {editingProduct ? 'Edit Product' : 'Add New Thrifted Item'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Form Fields */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isSubmitting}
                            placeholder="Enter product name"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            disabled={isSubmitting}
                            placeholder="Describe the product..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Current Price (₹) *</Label>
                            <Input
                              id="price"
                              type="number"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              required
                              disabled={isSubmitting}
                              placeholder="1800"
                            />
                          </div>
                          <div>
                            <Label htmlFor="originalPrice">Original Price (₹) *</Label>
                            <Input
                              id="originalPrice"
                              type="number"
                              value={formData.originalPrice}
                              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                              required
                              disabled={isSubmitting}
                              placeholder="3500"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} disabled={isSubmitting}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="condition">Condition *</Label>
                            <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })} disabled={isSubmitting}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                              <SelectContent>
                                {conditions.map((condition) => (
                                  <SelectItem key={condition} value={condition}>
                                    {condition}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="stock">Stock Quantity *</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={formData.stock}
                              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                              required
                              disabled={isSubmitting}
                              min="1"
                              placeholder="1"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <input
                              type="checkbox"
                              id="vintage"
                              checked={formData.vintage}
                              onChange={(e) => setFormData({ ...formData, vintage: e.target.checked })}
                              className="rounded border-gray-300"
                              disabled={isSubmitting}
                            />
                            <Label htmlFor="vintage">Vintage Item</Label>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded border-gray-300"
                            disabled={isSubmitting}
                          />
                          <Label htmlFor="isActive">Active (Show on website)</Label>
                        </div>
                      </div>
                      
                      {/* Right Column - Image Upload */}
                      <div className="space-y-4">
                        <Label>Product Images *</Label>
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          {imagePreviews.length > 0 ? (
                            <div className="flex flex-wrap gap-4 justify-center">
                              {imagePreviews.map((img, idx) => (
                                <div key={idx} className="relative">
                                  <Image
                                    src={img}
                                    alt={`Preview ${idx + 1}`}
                                    width={150}
                                    height={200}
                                    className="mx-auto rounded-lg object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                      setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                                      setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  Drag and drop images here, or{' '}
                                  <label htmlFor="file-upload" className="text-orange-600 hover:text-orange-500 cursor-pointer">
                                    browse
                                  </label>
                                </p>
                                <input
                                  id="file-upload"
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleFileInput}
                                  className="hidden"
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 10MB each
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {imagePreviews.length === 0 && (
                          <div>
                            <Label htmlFor="image-url">Or enter image URLs (comma separated)</Label>
                            <Input
                              id="image-url"
                              value={formData.images.join(',')}
                              onChange={(e) => {
                                const urls = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                setFormData(prev => ({ ...prev, images: urls }));
                                setImagePreviews(urls);
                              }}
                              placeholder="https://images.unsplash.com/...,https://..."
                              disabled={isSubmitting}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting || !formData.images.length}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {editingProduct ? 'Update' : 'Add'} Product
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {uniqueProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((product) => {
                const imagesArr = Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
                const idx = currentImageIdx[product.id || product._id] || 0;
                const showArrows = imagesArr.length > 1;
                return (
                  <Card key={product.id || product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative flex items-center justify-center">
                      {imagesArr.length > 0 ? (
                        <>
                          <Image
                            src={imagesArr[idx]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          {showArrows && (
                            <>
                              <button
                                type="button"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow hover:bg-white"
                                onClick={e => {
                                  e.stopPropagation();
                                  setCurrentImageIdx(prev => ({
                                    ...prev,
                                    [product.id || product._id]: (idx - 1 + imagesArr.length) % imagesArr.length
                                  }));
                                }}
                                aria-label="Previous image"
                              >
                                &#8592;
                              </button>
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow hover:bg-white"
                                onClick={e => {
                                  e.stopPropagation();
                                  setCurrentImageIdx(prev => ({
                                    ...prev,
                                    [product.id || product._id]: (idx + 1) % imagesArr.length
                                  }));
                                }}
                                aria-label="Next image"
                              >
                                &#8594;
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                      )}
                      {product.vintage && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                          Vintage
                        </div>
                      )}
                      {!product.isActive && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                          Inactive
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-orange-600">₹{product.price.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                        <span>{product.category}</span>
                        <span>{product.condition}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(product.id || product._id)}
                            disabled={isDeleting === (product.id || product._id)}
                          >
                            {isDeleting === (product.id || product._id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found. Add your first thrifted item!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 