'use client'; // Make this a client component

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, Plus, Minus, X, Gift } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context'; // Import useCart hook
import Image from 'next/image'; // Use next/image
import { useRouter } from 'next/navigation'; // Import useRouter
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

// Update CartItem type to only use id
interface CartItem {
  id?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    totalItems, 
    totalPrice, 
    clearCart,
    couponCode,
    isCouponApplied,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    finalTotal
  } = useCart();
  const router = useRouter(); // Get router instance
  const { user, loading } = useAuth();
  const [couponInput, setCouponInput] = useState('');

  console.log('CartPage - Loading:', loading, 'User:', user);

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
      toast.success(`Updated quantity to ${newQuantity}`);
    } else {
      removeFromCart(itemId);
      toast.success('Item removed from cart');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      const success = applyCoupon(couponInput);
      if (success) {
        setCouponInput('');
      }
    }
  };

  const handleQuickApplyCoupon = () => {
    const success = applyCoupon('1NCEMORE');
    if (success) {
      setCouponInput('');
    }
  };

  // Change delivery fee to 60 rupees for orders <= 500
  const shippingCost = finalTotal > 500 ? 0 : 60; // Updated from 50 to 60
  const total = finalTotal + shippingCost;

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-primary md:text-4xl">
        Your Shopping Cart
      </h1>

      {items.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-6 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild>
              <Link href="/clothes">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Prominent Coupon Banner */}
          {!isCouponApplied && (
            <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800">🎉 Special Offer!</h3>
                      <p className="text-sm text-green-600">Use code <span className="font-mono font-bold">1NCEMORE</span> to get ₹20 off</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleQuickApplyCoupon}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    Apply Coupon
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({totalItems})</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border p-0">
                  {items.map((item, index) => (
                    <div key={item.id || index} className="flex items-center gap-4 p-4">
                       <Image // Use next/image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded border object-cover"
                      />
                      <div className="flex-grow">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                         {/* Display single item price if quantity > 1 */}
                         {item.quantity > 1 && (
                           <p className="text-xs text-muted-foreground">(₹{item.price.toFixed(2)} each)</p>
                         )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Coupon Section */}
                  <div className="space-y-2">
                    {!isCouponApplied ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleApplyCoupon}
                          disabled={!couponInput.trim()}
                          size="sm"
                        >
                          Apply
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                        <div>
                          <p className="text-sm font-medium text-green-800">Coupon Applied</p>
                          <p className="text-xs text-green-600">{couponCode}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeCoupon}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Discount Display */}
                  {isCouponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
                  </div>
                  {finalTotal <= 500 && (
                    <div className="text-xs text-gray-500 mb-2">Free delivery on orders above ₹500</div>
                  )}
                  <hr className="my-2 border-border" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  {!user ? (
                    <div className="w-full space-y-3">
                      <p className="text-sm text-gray-600 text-center">
                        Please sign in to proceed with checkout
                      </p>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          size="lg"
                          variant="outline"
                          asChild
                        >
                          <Link href="/sign-in">Sign In</Link>
                        </Button>
                        <Button
                          className="flex-1"
                          size="lg"
                          asChild
                        >
                          <Link href="/sign-up">Sign Up</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={items.length === 0}
                      asChild
                    >
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
               <Button variant="link" asChild className="mt-4 w-full text-muted-foreground">
                 <Link href="/clothes">
                  Continue Shopping
                 </Link>
                </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
