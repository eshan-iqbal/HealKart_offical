import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Truck, Shield, Heart, Clock, Star } from 'lucide-react';
import Link from 'next/link';

const promotions = [
  {
    id: 1,
    title: 'Sustainable Fashion Week',
    description: 'Up to 60% off on vintage and thrifted pieces. Support eco-friendly fashion!',
    discount: '60% OFF',
    badge: 'Limited Time',
    icon: Leaf,
    color: 'from-green-100 to-emerald-100',
    textColor: 'text-green-700',
    href: '/clothes?promo=sustainable-week'
  },
  {
    id: 2,
    title: 'Free Shipping on Orders Over ₹500',
    description: 'Get free delivery on all orders above ₹500. Shop more, save more!',
    discount: 'FREE SHIPPING',
    badge: 'Always Available',
    icon: Truck,
    color: 'from-blue-100 to-cyan-100',
    textColor: 'text-blue-700',
    href: '/clothes?promo=free-shipping'
  },
  {
    id: 3,
    title: 'Quality Guarantee',
    description: 'All items are quality-checked and come with our satisfaction guarantee.',
    discount: '100% GUARANTEE',
    badge: 'Trusted',
    icon: Shield,
    color: 'from-purple-100 to-violet-100',
    textColor: 'text-purple-700',
    href: '/about'
  }
];

const benefits = [
  {
    icon: Heart,
    title: 'Eco-Friendly',
    description: 'Reduce fashion waste and support sustainable practices'
  },
  {
    icon: Star,
    title: 'Unique Pieces',
    description: 'Find one-of-a-kind items that tell stories'
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Get your thrifted treasures within 2-3 business days'
  }
];

export default function PromotionsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Special Offers & Benefits
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals on thrifted fashion while supporting sustainable practices. 
            Every purchase makes a positive impact.
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {promotions.map((promo) => {
            const IconComponent = promo.icon;
            return (
              <Card key={promo.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Icon and Badge */}
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${promo.color} flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 ${promo.textColor}`} />
                      </div>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                        {promo.badge}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {promo.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {promo.description}
                      </p>
                      <div className="text-2xl font-bold text-orange-600">
                        {promo.discount}
                      </div>
                    </div>
                    
                    {/* CTA */}
                    <Button asChild variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                      <Link href={promo.href}>
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Why Choose 1nceMore?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of fashion-conscious shoppers who choose sustainable style
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm">
                    <IconComponent className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* CTA */}
          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
              <Link href="/clothes">
                Start Shopping Sustainably
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
