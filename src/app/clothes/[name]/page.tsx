'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingBag, Heart, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
}

// Fallback data for suggested items
const fallbackSuggestedItems = [
  {
    _id: '7',
    name: 'Vintage Leather Belt',
    description: 'Classic leather belt with brass buckle. Perfect condition with rich patina.',
    price: 400.00,
    originalPrice: 800.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
    category: 'Accessories',
    condition: 'Excellent',
    vintage: true,
    stock: 4,
    isActive: true,
    rating: 4.7,
    reviews: 8,
    badge: 'Vintage'
  },
  {
    _id: '8',
    name: 'Retro Sunglasses',
    description: 'Stylish retro sunglasses with UV protection. Classic frame design.',
    price: 300.00,
    originalPrice: 600.00,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop',
    category: 'Accessories',
    condition: 'Good',
    vintage: false,
    stock: 6,
    isActive: true,
    rating: 4.5,
    reviews: 12,
    badge: 'Trending'
  },
  {
    _id: '9',
    name: 'Classic Denim Shirt',
    description: 'Timeless denim shirt perfect for layering. Soft, comfortable fabric.',
    price: 800.00,
    originalPrice: 1600.00,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    category: 'Tops',
    condition: 'Good',
    vintage: true,
    stock: 3,
    isActive: true,
    rating: 4.6,
    reviews: 9,
    badge: 'Classic'
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const productName = decodeURIComponent(params.name as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [suggestedItems, setSuggestedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          const foundProduct = data.products?.find((p: Product) => 
            p.name.toLowerCase() === productName.toLowerCase()
          );
          
          if (foundProduct) {
            setProduct(foundProduct);
            // Get suggested items from same category
            const suggested = data.products?.filter((p: Product) => 
              p._id !== foundProduct._id && p.category === foundProduct.category
            ).slice(0, 3) || fallbackSuggestedItems;
            setSuggestedItems(suggested);
          } else {
            // Use fallback data if product not found
            const fallbackProduct = fallbackSuggestedItems.find(p => 
              p.name.toLowerCase() === productName.toLowerCase()
            ) || {
              _id: '1',
              name: productName,
              description: 'A beautiful thrifted item with unique character and style. Each piece tells its own story and brings sustainable fashion to your wardrobe.',
              price: 1200.00,
              originalPrice: 2400.00,
              image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop',
              category: 'Fashion',
              condition: 'Excellent',
              vintage: true,
              stock: 5,
              isActive: true,
              rating: 4.8,
              reviews: 15,
              badge: 'Featured'
            };
            setProduct(fallbackProduct);
            setSuggestedItems(fallbackSuggestedItems);
          }
        } else {
          // Use fallback data
          const fallbackProduct = {
            _id: '1',
            name: productName,
            description: 'A beautiful thrifted item with unique character and style. Each piece tells its own story and brings sustainable fashion to your wardrobe.',
            price: 1200.00,
            originalPrice: 2400.00,
            image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop',
            category: 'Fashion',
            condition: 'Excellent',
            vintage: true,
            stock: 5,
            isActive: true,
            rating: 4.8,
            reviews: 15,
            badge: 'Featured'
          };
          setProduct(fallbackProduct);
          setSuggestedItems(fallbackSuggestedItems);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        // Use fallback data
        const fallbackProduct = {
          _id: '1',
          name: productName,
          description: 'A beautiful thrifted item with unique character and style. Each piece tells its own story and brings sustainable fashion to your wardrobe.',
          price: 1200.00,
          originalPrice: 2400.00,
          image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop',
          category: 'Fashion',
          condition: 'Excellent',
          vintage: true,
          stock: 5,
          isActive: true,
          rating: 4.8,
          reviews: 15,
          badge: 'Featured'
        };
        setProduct(fallbackProduct);
        setSuggestedItems(fallbackSuggestedItems);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productName]);

  const handleAddToCart = (item: Product, qty: number = 1) => {
    addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: qty
    });
    
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/clothes">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/clothes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image Carousel */}
          <div className="space-y-4">
            <div
              className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative flex items-center justify-center"
              onTouchStart={e => {
                touchStartX.current = e.touches[0].clientX;
              }}
              onTouchMove={e => {
                touchEndX.current = e.touches[0].clientX;
              }}
              onTouchEnd={() => {
                if (touchStartX.current !== null && touchEndX.current !== null) {
                  const diff = touchStartX.current - touchEndX.current;
                  if (Math.abs(diff) > 50) {
                    setCurrentImageIdx(idx => {
                      const imagesArr = Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
                      if (diff > 0) {
                        // swipe left
                        return (idx + 1) % imagesArr.length;
                      } else {
                        // swipe right
                        return (idx - 1 + imagesArr.length) % imagesArr.length;
                      }
                    });
                  }
                }
                touchStartX.current = null;
                touchEndX.current = null;
              }}
            >
              {(() => {
                const imagesArr = Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
                const showArrows = imagesArr.length > 1;
                return imagesArr.length > 0 ? (
                  <>
                    <img
                      src={imagesArr[currentImageIdx]}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                    {showArrows && (
                      <>
                        <button
                          type="button"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow hover:bg-white"
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentImageIdx(idx => (idx - 1 + imagesArr.length) % imagesArr.length);
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
                            setCurrentImageIdx(idx => (idx + 1) % imagesArr.length);
                          }}
                          aria-label="Next image"
                        >
                          &#8594;
                        </button>
                      </>
                    )}
                    {/* Dots */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {imagesArr.map((_, i) => (
                        <button
                          key={i}
                          className={`w-3 h-3 rounded-full ${i === currentImageIdx ? 'bg-orange-600' : 'bg-gray-300'} transition-colors`}
                          style={{ outline: 'none', border: 'none' }}
                          onClick={() => setCurrentImageIdx(i)}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                );
              })()}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badge */}
            <Badge className="bg-orange-600 text-white border-0">
              {product.badge || 'Featured'}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.floor(product.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-orange-600">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <Badge variant="secondary" className="text-sm bg-green-100 text-green-800">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Suggested Items */}
            <div className="border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {suggestedItems.map((item) => (
                  <Card key={item._id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm">
                    <CardContent className="p-0">
                      {/* Image Container */}
                      <div className="relative overflow-hidden">
                        <div className="aspect-[4/5] bg-gray-200 relative">
                          <div 
                            className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                            style={{ backgroundImage: `url(${Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image})` }}
                          />
                        </div>
                        {/* Badge */}
                        <Badge className="absolute top-3 left-3 bg-orange-600 text-white border-0">
                          {item.badge || 'Featured'}
                        </Badge>
                      </div>
                      {/* Content */}
                      <div className="p-4">
                        <div className="space-y-2">
                          {/* Category */}
                          <p className="text-sm text-gray-500 uppercase tracking-wide">
                            {item.category}
                          </p>
                          {/* Title */}
                          <Link href={`/clothes/${encodeURIComponent(item.name)}`}>
                            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors cursor-pointer">
                              {item.name}
                            </h3>
                          </Link>
                          
                          {/* Buy Now Button */}
                          <Button 
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Buy Now
                          </Button>
                          {/* Rating */}
                          <div className="flex items-center gap-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.floor(item.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-1">
                              ({item.reviews || 0})
                            </span>
                          </div>
                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-orange-600">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{item.originalPrice.toLocaleString('en-IN')}
                            </span>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                            </Badge>
                          </div>
                          {/* Condition */}
                          <p className="text-sm text-gray-600">
                            Condition: <span className="font-medium">{item.condition}</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-500">Category</span>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Condition</span>
                <p className="font-medium">{product.condition}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Stock</span>
                <p className="font-medium">{product.stock} available</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Type</span>
                <p className="font-medium">{product.vintage ? 'Vintage' : 'Pre-loved'}</p>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3"
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                onClick={() => handleAddToCart(product, quantity)}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Authenticity guaranteed</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">7-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 