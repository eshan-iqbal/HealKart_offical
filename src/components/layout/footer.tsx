import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Leaf, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">1nceMore</h3>
                <p className="text-sm text-gray-400">Thrifted Treasures</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Give pre-loved fashion a second life. Discover unique vintage pieces that tell stories and make a positive impact on our planet.
            </p>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-600 text-white border-0 text-xs">
                <Leaf className="w-3 h-3 mr-1" />
                Eco-Friendly
              </Badge>
              <Badge className="bg-orange-600 text-white border-0 text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Sustainable
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/clothes" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/clothes?category=vintage" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Vintage Collection
                </Link>
              </li>
              <li>
                <Link href="/clothes?category=dresses" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Dresses
                </Link>
              </li>
              <li>
                <Link href="/clothes?category=outerwear" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Outerwear
                </Link>
              </li>
              <li>
                <Link href="/clothes?category=accessories" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300 text-sm">1ncemore.es@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300 text-sm">+91-6006223504, +91-6005280251</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Kulgam Jammu & Kashmir, 192231
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Instagram className="w-4 h-4 text-orange-400" />
                <a href="https://instagram.com/1ncemore__" target="_blank" rel="noopener noreferrer" className="text-gray-300 text-sm hover:underline">@1ncemore__</a>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4">
              <h5 className="text-sm font-medium mb-3">Follow Us</h5>
              <div className="flex space-x-3">
                <a href="https://instagram.com/1ncemore__" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-orange-400 p-2 flex items-center">
                  <Instagram className="w-4 h-4 mr-1" />
                  <span className="sr-only">Instagram</span>
                </a>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-orange-400 p-2">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-orange-400 p-2">
                  <Facebook className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 1nceMore. All rights reserved. Making fashion sustainable, one thrifted piece at a time. By <a href="https://www.minmind.in" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">MinMind</a>.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/sustainability" className="text-gray-400 hover:text-orange-400 transition-colors">
                Sustainability
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
