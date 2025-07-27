'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, limit } from 'firebase/firestore';
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
  created_at?: string;
}

// Fallback data in case API fails
const fallbackClothes = [
  {
    _id: '1',
    name: 'Vintage Denim Jacket',
    description: 'A classic vintage denim jacket with authentic wear and character. Perfect for layering and adding a retro touch to any outfit.',
    price: 1800.00,
    originalPrice: 3500.00,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop',
    category: 'Outerwear',
    condition: 'Excellent',
    vintage: true,
    stock: 5,
    isActive: true,
    rating: 4.8,
    reviews: 12,
    badge: 'Best Seller'
  },
  {
    _id: '2',
    name: 'Retro Floral Dress',
    description: 'Beautiful retro floral dress with a flattering fit. Made from high-quality fabric with a timeless design that never goes out of style.',
    price: 1200.00,
    originalPrice: 2500.00,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    category: 'Dresses',
    condition: 'Good',
    vintage: true,
    stock: 3,
    isActive: true,
    rating: 4.6,
    reviews: 8,
    badge: 'New Arrival'
  },
  {
    _id: '3',
    name: 'Classic White Sneakers',
    description: 'Timeless white sneakers with minimal wear. Versatile and comfortable, perfect for everyday casual wear.',
    price: 900.00,
    originalPrice: 1800.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop',
    category: 'Footwear',
    condition: 'Excellent',
    vintage: false,
    stock: 8,
    isActive: true,
    rating: 4.9,
    reviews: 15,
    badge: 'Limited'
  },
  {
    _id: '4',
    name: 'Leather Crossbody Bag',
    description: 'Authentic leather crossbody bag with rich patina. Spacious interior with multiple compartments for organized storage.',
    price: 1400.00,
    originalPrice: 2800.00,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop',
    category: 'Bags',
    condition: 'Good',
    vintage: true,
    stock: 2,
    isActive: true,
    rating: 4.7,
    reviews: 11,
    badge: 'Popular'
  },
  {
    _id: '5',
    name: 'Vintage Band Tee',
    description: 'Authentic vintage band t-shirt with original graphics. Soft, well-worn fabric with that perfect vintage feel.',
    price: 600.00,
    originalPrice: 1200.00,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    category: 'Tops',
    condition: 'Fair',
    vintage: true,
    stock: 7,
    isActive: true,
    rating: 4.5,
    reviews: 6,
    badge: 'Trending'
  },
  {
    _id: '6',
    name: 'Silk Scarf Collection',
    description: 'Luxurious silk scarves with beautiful patterns. Perfect for adding elegance to any outfit or as a hair accessory.',
    price: 500.00,
    originalPrice: 1000.00,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop',
    category: 'Accessories',
    condition: 'Excellent',
    vintage: false,
    stock: 12,
    isActive: true,
    rating: 4.8,
    reviews: 9,
    badge: 'Eco-Friendly'
  }
];



export default function FeaturedClothesSection() {
  // Always declare all hooks at the top, before any early returns
  const [featuredClothes, setFeaturedClothes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(1);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simplified query to avoid index issues
        const q = query(collection(db, 'products'), limit(10));
        const snapshot = await getDocs(q);
        let products = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })) as Product[];
        
        // Filter active products and sort by creation date client-side
        products = products
          .filter(product => product.isActive === true)
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 6);
          
        setFeaturedClothes(products.length > 0 ? products : fallbackClothes);
      } catch (error) {
        console.error('Failed to fetch products from Firestore:', error);
        setFeaturedClothes(fallbackClothes);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!loading && visibleCount < 4 && featuredClothes.length > visibleCount) {
      const timer = setTimeout(() => setVisibleCount(c => c + 1), 350);
      return () => clearTimeout(timer);
    }
  }, [loading, visibleCount, featuredClothes]);

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item._id || item.id, // Always include Firestore doc id
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

  // Only show the first 4 products, but reveal them one by one
  const productsToShow = featuredClothes.slice(0, Math.min(4, visibleCount));

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Thrifted Treasures
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Loading amazing thrifted pieces...
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[4/5] rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Thrifted Treasures
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked vintage and pre-loved pieces that combine style with sustainability. 
            Each item tells a unique story.
          </p>
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {productsToShow.map((item) => {
            const imagesArr = Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);
            const showImage = hoveredProductId === (item.id || item._id) && imagesArr.length > 1 ? imagesArr[1] : imagesArr[0];
            // Preload second image if available
            if (typeof window !== 'undefined' && imagesArr[1]) {
              const img = new window.Image();
              img.src = imagesArr[1];
            }
            return (
              <Card
                key={item._id}
                className="group hover:shadow-lg transition-shadow duration-300"
                onMouseEnter={() => setHoveredProductId((item.id ?? item._id) ?? null)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <div className="relative overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-200" style={{ width: 160, height: 200, margin: '0 auto' }}>
                  <img
                    src={showImage}
                    alt={item.name}
                    className="object-cover group-hover:scale-105 transition-transform duration-300 rounded"
                    style={{ width: 160, height: 200 }}
                  />
                  {item.badge && (
                    <Badge className="absolute top-2 left-2 bg-orange-600 text-white">
                      {item.badge}
                    </Badge>
                  )}
                  {item.vintage && (
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
                    <Link href={`/clothes/${encodeURIComponent(item.name)}`}>
                      <h3 className="font-semibold text-lg line-clamp-2 mb-1 hover:text-orange-600 transition-colors cursor-pointer">{item.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {item.condition}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{item.rating || 4.5}</span>
                    <span className="text-sm text-gray-500">({item.reviews || 0})</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                    )}
                  </div>
                  

                  
                  <Button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className={item.stock === 0 ? 'opacity-50 cursor-not-allowed w-full' : 'w-full'}
                  >
                    {item.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
            <Link href="/clothes">
              View All Thrifted Items
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 