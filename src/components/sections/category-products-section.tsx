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
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
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
        let q = query(
          collection(db, 'products'),
          where('category', '==', category.toLowerCase()),
          where('isActive', '==', true),
          limit(maxProducts)
        );

        // Apply sorting
        switch (sortBy) {
          case 'newest':
            q = query(q, orderBy('createdAt', 'desc'));
            break;
          case 'price-low':
            q = query(q, orderBy('price', 'asc'));
            break;
          case 'price-high':
            q = query(q, orderBy('price', 'desc'));
            break;
          case 'rating':
            q = query(q, orderBy('rating', 'desc'));
            break;
        }

        const snapshot = await getDocs(q);
        let fetchedProducts = snapshot.docs.map(doc => ({ 
          _id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        })) as Product[];

        // Apply condition filter
        if (filterCondition !== 'all') {
          fetchedProducts = fetchedProducts.filter(product => 
            product.condition.toLowerCase() === filterCondition.toLowerCase()
          );
        }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm">
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
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
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
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
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