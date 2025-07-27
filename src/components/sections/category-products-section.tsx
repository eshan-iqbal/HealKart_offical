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
  Filter,
  SortAsc,
  SortDesc,
  TrendingUp,
  Clock,
  Zap,
  Shirt,
  Footprints,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
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
  createdAt?: any;
}

interface CategoryProductsSectionProps {
  category: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  textColor: string;
  maxProducts?: number;
  showFilters?: boolean;
}

export default function CategoryProductsSection({
  category,
  title,
  description,
  iconName,
  color,
  textColor,
  maxProducts = 4,
  showFilters = true
}: CategoryProductsSectionProps) {
  // Icon mapping
  const iconMap: { [key: string]: any } = {
    shirt: Shirt,
    star: Star,
    footprints: Footprints,
    briefcase: Briefcase
  };
  
  const IconComponent = iconMap[iconName] || Shirt;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simplified query to avoid composite index issues
        let q = query(
          collection(db, 'products'),
          where('category', '==', category.toLowerCase()),
          limit(maxProducts * 2) // Get more products to filter client-side
        );

        const snapshot = await getDocs(q);
        let fetchedProducts = snapshot.docs.map(doc => ({ 
          _id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        })) as Product[];

        // Apply filters client-side
        fetchedProducts = fetchedProducts.filter(product => 
          product.isActive === true
        );

        // Apply condition filter
        if (filterCondition !== 'all') {
          fetchedProducts = fetchedProducts.filter(product => 
            product.condition.toLowerCase() === filterCondition.toLowerCase()
          );
        }

        // Apply sorting client-side
        switch (sortBy) {
          case 'newest':
            fetchedProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            break;
          case 'price-low':
            fetchedProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            fetchedProducts.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            fetchedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        }

        // Limit to maxProducts
        fetchedProducts = fetchedProducts.slice(0, maxProducts);

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sortBy, filterCondition, maxProducts]);

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

  const getSortIcon = () => {
    switch (sortBy) {
      case 'price-low':
        return <SortAsc className="w-4 h-4" />;
      case 'price-high':
        return <SortDesc className="w-4 h-4" />;
      case 'rating':
        return <Star className="w-4 h-4" />;
      case 'newest':
        return <Clock className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 aspect-[3/4] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
              <IconComponent className={`w-6 h-6 ${textColor}`} />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600">{description}</p>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const options = ['newest', 'price-low', 'price-high', 'rating'];
                    const currentIndex = options.indexOf(sortBy);
                    const nextIndex = (currentIndex + 1) % options.length;
                    setSortBy(options[nextIndex] as any);
                  }}
                >
                  {getSortIcon()}
                  {sortBy === 'newest' && 'Newest'}
                  {sortBy === 'price-low' && 'Price: Low to High'}
                  {sortBy === 'price-high' && 'Price: High to Low'}
                  {sortBy === 'rating' && 'Top Rated'}
                </Button>
              </div>

              {/* Condition Filter */}
              <div className="flex gap-1">
                {['all', 'excellent', 'good', 'fair'].map((condition) => (
                  <Button
                    key={condition}
                    variant={filterCondition === condition ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterCondition(condition)}
                    className="capitalize"
                  >
                    {condition}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Card key={product._id} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="relative overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-200" style={{ width: 160, height: 200, margin: '0 auto' }}>
                <img
                  src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image}
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

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
            <Link href={`/clothes?category=${category.toLowerCase()}`}>
              View All {title}
              <Zap className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 