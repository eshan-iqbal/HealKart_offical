'use client'; // This component needs client-side interaction for filters/search

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import SearchBar from '@/components/ui/search-bar';
import { useRouter } from 'next/navigation';

export default function SearchFilterSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  const router = useRouter();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'tops', label: 'Tops & Shirts' },
    { value: 'dresses', label: 'Dresses' },
    { value: 'outerwear', label: 'Outerwear' },
    { value: 'bottoms', label: 'Bottoms' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'bags', label: 'Bags & Accessories' },
    { value: 'jewelry', label: 'Jewelry & Watches' },
    { value: 'hats', label: 'Hats & Caps' },
    { value: 'scarves', label: 'Scarves & Wraps' }
  ];

  const conditions = [
    { value: 'all', label: 'All Conditions' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'vintage', label: 'Vintage' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-500', label: 'Under ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-2000', label: '₹1000 - ₹2000' },
    { value: '2000+', label: 'Over ₹2000' }
  ];

  const handleSearch = () => {
    // Handle search logic here
    console.log('Search:', { searchQuery, selectedCategory, selectedCondition, selectedPriceRange });
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSelectedPriceRange('all');
    setSearchQuery('');
  };

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Search Bar - now separate and centered, with reduced width but larger size */}
              <div className="flex justify-center">
                <div className="w-full max-w-lg">
                  <SearchBar
                    highlighted={true}
                    placeholder="Search for vintage tees, retro dresses, classic denim..."
                    onSearch={query => {
                      if (query && query.trim()) router.push(`/clothes?search=${encodeURIComponent(query)}`);
                    }}
                    className="text-2xl py-4"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Condition</label>
                  <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                    <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Price Range</label>
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">&nbsp;</label>
                  <Button 
                    onClick={handleSearch}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Quick Filters:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => setSelectedCondition('vintage')}
                >
                  Vintage
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => setSelectedPriceRange('0-500')}
                >
                  Under ₹500
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => setSelectedCondition('excellent')}
                >
                  Excellent Condition
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
