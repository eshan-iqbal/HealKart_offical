'use client';

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CartBadge() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative">
      <Button variant="ghost" size="sm" className="text-gray-700 hover:text-orange-600 relative">
        <ShoppingCart className="w-5 h-5" />
        {totalItems > 0 && (
          <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-orange-600 text-white border-0 min-w-0 flex items-center justify-center">
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </Button>
    </Link>
  );
} 