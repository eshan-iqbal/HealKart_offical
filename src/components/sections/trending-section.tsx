'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Heart, 
  Eye, 
  Star, 
  TrendingUp,
  Flame,
  Users,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, limit, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Product {
  _id: string;
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
  views?: number;
}

export default function TrendingSection() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        // Simplified query to avoid index issues
        const q = query(
          collection(db, 'products'),
          limit(20) // Get more products to sort client-side
        );
        
        const snapshot = await getDocs(q);
        let products = snapshot.docs.map(doc => ({ 
          _id: doc.id, 
          ...doc.data(),
          views: doc.data().views || 0
        })) as Product[];

        // Filter active products and sort by views client-side
        products = products
          .filter(product => product.isActive === true)
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 8); // Take top 8

        setTrendingProducts(products);
      } catch (error) {
        console.error('Failed to fetch trending products:', error);
        setTrendingProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  const incrementViews = async (productId: string) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  };

  const handleAddToCart = (item: Product) => {
    addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image,
      quantity: 1
    });
    
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 aspect-[3/4] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Trending Now
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the most popular and highly-rated thrifted pieces that everyone's loving right now.
          </p>
        </div>

        {/* Trending Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {trendingProducts.map((product, index) => (
            <Card key={product._id} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="relative overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-200" style={{ width: 160, height: 200, margin: '0 auto' }}>
                <img
                  src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image}
                  alt={product.name}
                  className="object-cover group-hover:scale-105 transition-transform duration-300 rounded"
                  style={{ width: 160, height: 200 }}
                />
                {index < 3 && (
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    #{index + 1} Trending
                  </Badge>
                )}
                {product.badge && (
                  <Badge className="absolute top-2 right-2 bg-orange-600 text-white">
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
                  <Link href={`/clothes/${encodeURIComponent(product.name)}`} onClick={() => incrementViews(product._id)}>
                    <h3 className="font-semibold text-lg line-clamp-2 mb-1 hover:text-orange-600 transition-colors cursor-pointer">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {product.condition}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1 mb-3">
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
                

                
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className={product.stock === 0 ? 'opacity-50 cursor-not-allowed w-full' : 'w-full'}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Trending Button */}
        <div className="text-center mt-8">
          <Button asChild size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3">
            <Link href="/clothes?sort=trending">
              View All Trending Items
              <TrendingUp className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 