import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shirt, 
  Star, 
  Footprints, 
  Briefcase, 
  Clock, 
  Heart, 
  Crown, 
  Glasses 
} from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    name: 'Tops & Shirts',
    icon: Shirt,
    description: 'Vintage tees, blouses & more',
    color: 'from-orange-100 to-amber-100',
    textColor: 'text-orange-700',
    href: '/clothes?category=tops'
  },
  {
    name: 'Dresses',
    icon: Star,
    description: 'Unique dresses for every occasion',
    color: 'from-pink-100 to-rose-100',
    textColor: 'text-pink-700',
    href: '/clothes?category=dresses'
  },
  {
    name: 'Footwear',
    icon: Footprints,
    description: 'Shoes, boots & sneakers',
    color: 'from-blue-100 to-cyan-100',
    textColor: 'text-blue-700',
    href: '/clothes?category=footwear'
  },
  {
    name: 'Bags & Accessories',
    icon: Briefcase,
    description: 'Handbags, backpacks & more',
    color: 'from-purple-100 to-violet-100',
    textColor: 'text-purple-700',
    href: '/clothes?category=bags'
  },
  {
    name: 'Jewelry & Watches',
    icon: Clock,
    description: 'Vintage jewelry & timepieces',
    color: 'from-green-100 to-emerald-100',
    textColor: 'text-green-700',
    href: '/clothes?category=jewelry'
  },
  {
    name: 'Scarves & Wraps',
    icon: Heart,
    description: 'Silk scarves & cozy wraps',
    color: 'from-red-100 to-pink-100',
    textColor: 'text-red-700',
    href: '/clothes?category=scarves'
  },
  {
    name: 'Hats & Caps',
    icon: Crown,
    description: 'Vintage hats & baseball caps',
    color: 'from-yellow-100 to-orange-100',
    textColor: 'text-yellow-700',
    href: '/clothes?category=hats'
  },
  {
    name: 'Sunglasses',
    icon: Glasses,
    description: 'Retro shades & frames',
    color: 'from-indigo-100 to-blue-100',
    textColor: 'text-indigo-700',
    href: '/clothes?category=sunglasses'
  }
];

export default function CategoriesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover unique thrifted pieces across all your favorite clothing categories. 
            Each item has been carefully selected for quality and style.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.name} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardContent className="p-6">
                  <Link href={category.href} className="block">
                    <div className="text-center space-y-4">
                      {/* Icon */}
                      <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`w-8 h-8 ${category.textColor}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 px-8 py-3">
            <Link href="/clothes">
              View All Categories
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
