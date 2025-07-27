'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Truck, 
  RotateCcw, 
  Heart, 
  Star, 
  Users, 
  Zap,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Shield,
    title: 'Authenticity Guaranteed',
    description: 'Every item is carefully verified for authenticity and quality before listing.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    icon: Truck,
    title: 'Fast & Free Shipping',
    description: 'Free delivery on orders above ₹500. Express shipping available.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    icon: RotateCcw,
    title: '7-Day Returns',
    description: 'Not satisfied? Return within 7 days for a full refund.',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    icon: Heart,
    title: 'Sustainable Fashion',
    description: 'Join the circular fashion movement and reduce environmental impact.',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  {
    icon: Star,
    title: 'Curated Collections',
    description: 'Handpicked vintage and pre-loved pieces from trusted sources.',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join thousands of fashion enthusiasts making sustainable choices.',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
];



export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose 1nceMore?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're not just another thrift store. We're a community of fashion lovers committed to sustainable shopping.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className={`${feature.bgColor} ${feature.borderColor} border-2 hover:shadow-lg transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>



        {/* How It Works */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h4 className="font-semibold text-lg mb-2">Browse & Discover</h4>
              <p className="text-gray-600">Explore our curated collection of unique, pre-loved fashion pieces.</p>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-orange-500 to-red-500 transform translate-x-4"></div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h4 className="font-semibold text-lg mb-2">Add to Cart</h4>
              <p className="text-gray-600">Add your favorite items to the cart and proceed to secure checkout.</p>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-orange-500 to-red-500 transform translate-x-4"></div>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h4 className="font-semibold text-lg mb-2">Fast Delivery</h4>
              <p className="text-gray-600">Get your thrifted treasures delivered quickly and sustainably.</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Trusted by Thousands
            </h3>
            <p className="text-gray-600">
              See what our customers have to say about their experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Absolutely love the unique finds! The quality is amazing and shipping was super fast."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                  P
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Priya S.</div>
                  <div className="text-sm text-gray-500">Verified Buyer</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "1nceMore makes sustainable shopping so easy. I always find something special."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                  R
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Rahul M.</div>
                  <div className="text-sm text-gray-500">Verified Buyer</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Great prices, great mission, and beautiful clothes. Highly recommend!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Ayesha K.</div>
                  <div className="text-sm text-gray-500">Verified Buyer</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3">
            <Link href="/clothes">
              Start Shopping Now
              <Zap className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 