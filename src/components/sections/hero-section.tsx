import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Heart, Star, Truck } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23fbbf24%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 px-4 py-2 text-sm font-medium">
                <Heart className="w-4 h-4 mr-2" />
                Sustainable Fashion
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Discover Unique
                <span className="text-orange-600 block">Thrifted Treasures</span>
                at 1nceMore
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Give pre-loved fashion a second life. Find one-of-a-kind pieces that tell stories and make a positive impact on our planet.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm text-gray-700">Curated Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm text-gray-700">Fast Delivery</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-semibold">
                <Link href="/clothes">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Now
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-orange-200 text-orange-700 hover:bg-orange-50 px-8 py-3 text-lg font-semibold">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            {/* (Removed the grid with 10K+ Happy Customers, 50K+ Items Sold, 95% Satisfaction Rate) */}
          </div>

          {/* Right Content - Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">Vintage Denim</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 font-semibold">Eco-Friendly</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white rounded-2xl p-4 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">Unique Style</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">Quality Checked</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-amber-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
