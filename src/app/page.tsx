import { Suspense } from 'react';
import HeroSection from '@/components/sections/hero-section';
import CategoriesSection from '@/components/sections/categories-section';
import FeaturedClothesSection from '@/components/sections/featured-clothes-section';
import CategoryProductsSection from '@/components/sections/category-products-section';
import TrendingSection from '@/components/sections/trending-section';
import FeaturesSection from '@/components/sections/features-section';
import PromotionsSection from '@/components/sections/promotions-section';
import SearchFilterSection from '@/components/sections/search-filter-section';
import PromoBanner from '@/components/ui/promo-banner';
import { Skeleton } from '@/components/ui/skeleton';
const categorySections = [
  {
    category: 'tops',
    title: 'Tops & Shirts',
    description: 'Discover unique vintage tees, elegant blouses, and trendy tops',
    iconName: 'shirt',
    color: 'from-orange-100 to-amber-100',
    textColor: 'text-orange-700',
    maxProducts: 4
  },
  {
    category: 'dresses',
    title: 'Dresses',
    description: 'From casual day dresses to elegant evening wear',
    iconName: 'star',
    color: 'from-pink-100 to-rose-100',
    textColor: 'text-pink-700',
    maxProducts: 4
  },
  {
    category: 'footwear',
    title: 'Footwear',
    description: 'Stylish shoes, boots, and sneakers for every occasion',
    iconName: 'footprints',
    color: 'from-blue-100 to-cyan-100',
    textColor: 'text-blue-700',
    maxProducts: 4
  },
  {
    category: 'bags',
    title: 'Bags & Accessories',
    description: 'Handbags, backpacks, and fashion accessories',
    iconName: 'briefcase',
    color: 'from-purple-100 to-violet-100',
    textColor: 'text-purple-700',
    maxProducts: 4
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <HeroSection />
      </Suspense>

      {/* Promotional Banner */}
      <PromoBanner
        title="Flash Sale Alert!"
        description="Up to 90% off on vintage and thrifted pieces"
        offer="90% OFF"
        badge="Flash Sale"
        ctaText="Shop Now"
        ctaLink="/clothes"
        variant="flash"
        icon="gift"
      />

      {/* Featured Clothes Section */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <FeaturedClothesSection />
      </Suspense>

      {/* Search and Filter Section */}
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <SearchFilterSection />
      </Suspense>

      {/* Trending Section */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <TrendingSection />
      </Suspense>

      {/* Categories Section */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <CategoriesSection />
      </Suspense>

      {/* Category-wise Product Sections */}
      {categorySections.map((section) => (
        <Suspense key={section.category} fallback={<Skeleton className="h-96 w-full" />}>
          <CategoryProductsSection
            category={section.category}
            title={section.title}
            description={section.description}
            iconName={section.iconName}
            color={section.color}
            textColor={section.textColor}
            maxProducts={section.maxProducts}
            showFilters={false}
          />
        </Suspense>
      ))}

      {/* Features Section */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <FeaturesSection />
      </Suspense>

      {/* Promotions Section */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <PromotionsSection />
      </Suspense>

      {/* Newsletter Signup Section */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Stay in the Loop</h2>
          <p className="mb-6 text-gray-700">Subscribe to our newsletter for exclusive offers, new arrivals, and sustainable fashion tips.</p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-orange-500 w-full sm:w-auto" 
              required 
            />
            <button 
              type="submit" 
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
