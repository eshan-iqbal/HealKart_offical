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
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
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
  soldCount?: number;
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
        // Fetch products with high ratings and reviews (trending indicators)
        const q = query(
          collection(db, 'products'),
          orderBy('rating', 'desc'),
          limit(8)
        );
        
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ 
          _id: doc.id, 
          ...doc.data(),
          views: Math.floor(Math.random() * 1000) + 100, // Mock data
          soldCount: Math.floor(Math.random() * 50) + 5 // Mock data
        })) as Product[];

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product, index) => (
            <Card key={product._id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm relative">
              {/* Trending Badge */}
              {index < 3 && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    #{index + 1} Trending
                  </Badge>
                </div>
              )}

              <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <div className="aspect-[4/5] bg-gray-200 relative">
                    <div 
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url(${Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image})` }}
                    />
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {product.badge && (
                      <Badge className="bg-orange-600 text-white border-0">
                        {product.badge}
                      </Badge>
                    )}
                    {product.vintage && (
                      <Badge className="bg-purple-600 text-white border-0">
                        Vintage
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="sm" variant="secondary" className="w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white"
                      asChild
                    >
                      <Link href={`/clothes/${encodeURIComponent(product.name)}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Social Proof Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{product.views} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{product.soldCount} sold</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="space-y-2">
                    {/* Category */}
                    <p className="text-sm text-gray-500 uppercase tracking-wide">
                      {product.category}
                    </p>
                    
                    {/* Title */}
                    <Link href={`/clothes/${encodeURIComponent(product.name)}`}>
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors cursor-pointer line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-1">
                        ({product.reviews || 0})
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-orange-600">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </Badge>
                    </div>
                    
                    {/* Condition */}
                    <p className="text-sm text-gray-600">
                      Condition: <span className="font-medium capitalize">{product.condition}</span>
                    </p>

                    {/* Buy Now Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                    </Button>
                  </div>
                </div>
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