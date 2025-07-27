'use client';

import { useState, useEffect } from 'react';
import SearchFilterSection from '@/components/sections/search-filter-section';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ShoppingCart, Star, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRef, useCallback } from 'react';
// Remove SWR and use manual fetch for progressive loading

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Product {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  category: string;
  condition: string;
  vintage: boolean;
  stock: number;
  isActive: boolean;
  rating?: number;
  reviews?: number;
  badge?: string;
}

// Fade-in animation CSS
const fadeInStyle = {
  animation: 'fadeIn 0.5s ease',
};

// Add global style for fadeIn keyframes
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;} }`;
  document.head.appendChild(style);
}

export default function ClothesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (res.ok && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again.',
          variant: 'destructive',
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAllProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const id = product._id || product.id;
    if (!id) {
      toast({
        title: 'Error',
        description: 'Product ID is missing. Cannot add to cart.',
        variant: 'destructive',
      });
      return;
    }
    addToCart({
      id,
      name: product.name,
      price: product.price,
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image,
      quantity: 1
    });
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Deduplicate products by id
  const uniqueProducts = Array.from(
    new Map(products.map(p => [(p.id || p._id), p])).values()
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 text-center text-4xl font-bold tracking-tight text-primary">
        Shop Thrifted Fashion
      </h1>
      
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {products.length} products
        </p>
      </div>

      {/* Products Grid */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12 text-red-500 font-semibold">No products found in the database. Please add products in the admin panel.</div>
      )}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {uniqueProducts.map((product) => {
              const imagesArr = Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
              const showImage = hoveredProductId === (product.id || product._id) && imagesArr.length > 1 ? imagesArr[1] : imagesArr[0];
              // Preload second image if available
              if (typeof window !== 'undefined' && imagesArr[1]) {
                const img = new window.Image();
                img.src = imagesArr[1];
              }
              return (
                <Card
                  key={product.id || product._id}
                  className="group hover:shadow-lg transition-shadow duration-300"
                  style={fadeInStyle}
                  onMouseEnter={() => setHoveredProductId((product.id ?? product._id) ?? null)}
                  onMouseLeave={() => setHoveredProductId(null)}
                >
                  <div className="relative overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-200" style={{ width: 160, height: 200, margin: '0 auto' }}>
                    <img
                      src={showImage}
                      alt={product.name}
                      className="object-cover group-hover:scale-105 transition-transform duration-300 rounded"
                      style={{ width: 160, height: 200 }}
                    />
                    {product.badge && (
                      <Badge className="absolute top-2 left-2 bg-orange-600 text-white">
                        {product.badge}
                      </Badge>
                    )}
                    {product.vintage && (
                      <Badge className="absolute top-2 right-2 bg-purple-600 text-white">
                        Vintage
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Link href={`/clothes/${encodeURIComponent(product.name)}`}>
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1 hover:text-orange-600 transition-colors cursor-pointer">{product.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.condition}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating || 4.5}</span>
                      <span className="text-sm text-gray-500">({product.reviews || 0})</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-orange-600">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      {product.stock > 0 ? (
                        <span className="text-green-600">In Stock ({product.stock} available)</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={product.stock === 0 ? 'opacity-50 cursor-not-allowed w-full' : 'w-full'}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
} 