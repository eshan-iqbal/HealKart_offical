'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ShoppingBag, Star, Truck, Gift, Clock } from 'lucide-react';
import Link from 'next/link';

interface PromoBannerProps {
  title: string;
  description?: string;
  offer?: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
  variant?: 'default' | 'flash' | 'gradient';
  dismissible?: boolean;
  icon?: 'shopping' | 'star' | 'truck' | 'gift' | 'clock';
}

export default function PromoBanner({
  title,
  description,
  offer,
  badge = 'Limited Time',
  ctaText = 'Shop Now',
  ctaLink = '/clothes',
  variant = 'default',
  dismissible = true,
  icon = 'shopping'
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (icon) {
      case 'star':
        return <Star className="w-5 h-5" />;
      case 'truck':
        return <Truck className="w-5 h-5" />;
      case 'gift':
        return <Gift className="w-5 h-5" />;
      case 'clock':
        return <Clock className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'flash':
        return 'bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse';
      case 'gradient':
        return 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600';
      default:
        return 'bg-orange-600';
    }
  };

  return (
    <div className={`relative ${getVariantStyles()} text-white overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {getIcon()}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                {badge && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                    {badge}
                  </Badge>
                )}
                <h3 className="text-lg font-bold truncate">{title}</h3>
              </div>
              
              {description && (
                <p className="text-sm text-white/90 truncate">{description}</p>
              )}
              
              {offer && (
                <p className="text-2xl font-bold text-yellow-300 mt-1">{offer}</p>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4 ml-4">
            <Button
              asChild
              size="sm"
              className="bg-white text-orange-600 hover:bg-white/90 font-semibold"
            >
              <Link href={ctaLink}>
                {ctaText}
              </Link>
            </Button>

            {/* Dismiss Button */}
            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 