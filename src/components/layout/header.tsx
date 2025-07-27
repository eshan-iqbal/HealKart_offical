'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Menu, X, Settings, LogOut, ShoppingBag, Clock, Info, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/context/cart-context';
import CartBadge from '@/components/cart-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative w-32 h-14 lg:w-44 lg:h-20 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo"
                fill
                sizes="(max-width: 1024px) 128px, 176px"
                className="object-contain rounded-md group-hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/clothes" className="group flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
              </div>
              <span>Shop</span>
            </Link>
            <Link href="/clothes?category=vintage" className="group flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
              <span>Vintage</span>
            </Link>
            <Link href="/about" className="group flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Info className="w-4 h-4 text-white" />
                </div>
              </div>
              <span>About</span>
            </Link>
            <Link href="/contact" className="group flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-pink-500 to-rose-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Mail className="w-4 h-4 text-white" />
                </div>
              </div>
              <span>Contact</span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Cart with Badge */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-orange-600 relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-orange-600 text-white border-0 min-w-0">
                    {totalItems > 99 ? '99+' : totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-orange-600">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm" className="text-gray-700 hover:text-orange-600">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Cart with Badge for Mobile */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-orange-600 relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-orange-600 text-white border-0 min-w-0">
                    {totalItems > 99 ? '99+' : totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/clothes" 
                className="group flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span>Shop</span>
              </Link>
              <Link 
                href="/clothes?category=vintage" 
                className="group flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span>Vintage</span>
              </Link>
              <Link 
                href="/about" 
                className="group flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span>About</span>
              </Link>
              <Link 
                href="/contact" 
                className="group flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-pink-500 to-rose-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span>Contact</span>
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">{user.fullName || user.email}</span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                      <Link href="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                    </Button>
                    {user.role === 'admin' && (
                      <Button asChild variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                        <Link href="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild variant="ghost" size="sm" className="w-full text-gray-700 hover:text-orange-600">
                      <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
