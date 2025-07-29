'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AddressForm, type AddressSchema } from '@/components/forms/address-form'; // Import AddressForm and its schema type
import Image from 'next/image';
import { IndianRupee, Truck, Loader2, X, Gift } from 'lucide-react'; // Icons
import { createOrder } from '@/services/orders'; // Import the createOrder service
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Script from 'next/script';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function CheckoutPage() {
  const { 
    user, 
    loading: authLoading 
  } = useAuth();
  const { 
    items, 
    totalPrice, 
    clearCart, 
    totalItems,
    couponCode,
    isCouponApplied,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    finalTotal
  } = useCart();
  const router = useRouter();
  const { toast: useToastToast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined);
  const [addressData, setAddressData] = useState<AddressSchema | null>(null); // State to hold address form data
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState<AddressSchema | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const addressFormRef = useRef<any>(null);

  // Remove Razorpay handler and all Razorpay logic

  // Redirect if not signed in or cart is empty
  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder) { // Don't redirect if order was just placed
      useToastToast({
        title: 'Your cart is empty',
        description: 'Add items to your cart before proceeding to checkout.',
        variant: 'destructive',
      });
      router.push('/clothes');
    }
  }, [items.length, router, useToastToast, isPlacingOrder]);

  useEffect(() => {
    // Fetch saved address from user profile on mount
    async function fetchSavedAddress() {
      if (!user) return;
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.user && data.user.address) {
          let parsed = null;
          try {
            parsed = typeof data.user.address === 'string' ? JSON.parse(data.user.address) : data.user.address;
          } catch {
            parsed = null;
          }
          setSavedAddress(parsed);
        }
      } catch (e) {
        // Ignore error, just don't autofill
      }
    }
    fetchSavedAddress();
  }, [user]);

  // Save address to user profile on click
  async function handleSaveAddress(address: AddressSchema) {
    try {
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address: JSON.stringify(address) })
      });
      setSavedAddress(address);
      toast.success('Address saved for future use!');
    } catch (e) {
      toast.error('Failed to save address.');
    }
  }

  // Autofill form with saved address
  function handleSelectSavedAddress() {
    if (savedAddress && addressFormRef.current) {
      addressFormRef.current.setFormValues(savedAddress);
      setAddressData(savedAddress);
      toast.success('Saved address loaded!');
    }
  }

  // Save address on form submit (for order)
  function handleAddressSubmit(address: AddressSchema) {
    setAddressData(address);
  }

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
  const totalAmount = finalTotal + shippingCost;

  // Remove Razorpay key, isRazorpayLoaded, openRazorpay, and all Razorpay payment method UI and logic

  const handlePlaceOrder = async () => {
    console.log('[Checkout] handlePlaceOrder triggered'); // Log start

    if (!addressData) {
       console.log('[Checkout] Address data missing.');
      useToastToast({
        title: 'Missing Address',
        description: 'Please select or add a delivery address.',
        variant: 'destructive',
      });
      return;
    }
     console.log('[Checkout] Address data present:', addressData);

    if (!selectedPaymentMethod) {
       console.log('[Checkout] Payment method not selected.');
      useToastToast({
        title: 'Missing Payment Method',
        description: 'Please select a payment method.',
        variant: 'destructive',
      });
      return;
    }
     console.log('[Checkout] Payment method selected:', selectedPaymentMethod);

    setIsPlacingOrder(true);
     console.log('[Checkout] isPlacingOrder set to true');


    try {
        // Prepare order data
       const orderPayload = {
        userId: user?._id || 'unknown-user-id',
        userEmail: user?.email || 'unknown@example.com',
        items: items,
        totalAmount: totalAmount,
        shippingCost: shippingCost, // Added
        shippingAddress: addressData,
        paymentMethod: selectedPaymentMethod,
        couponCode: isCouponApplied ? couponCode : undefined,
        couponDiscount: isCouponApplied ? couponDiscount : 0,
       };

       console.log('[Checkout] Order Payload prepared:', JSON.stringify(orderPayload, null, 2)); // Log the payload
       console.log('[Checkout] Calling createOrder service function...');

      // Only WhatsApp and disabled COD payment options remain
      if (selectedPaymentMethod === 'whatsapp') {
        // Place the order as usual
        const order = await createOrder(orderPayload);
        setConfirmedOrderId(order._id || null);
        setShowConfirmation(true);
        toast.success('Order placed! Please confirm payment via WhatsApp.');
        // Prepare WhatsApp URL for user to click
        const phone = '919906577930'; // WhatsApp number in international format (no +)
        const messageText = `Hi, I have placed an order (Order ID: ${order._id}). Please confirm my payment and order details. I want to pay via WhatsApp to +91 99065 77930.`;
        const message = encodeURIComponent(messageText);
        setWhatsappUrl(`https://wa.me/${phone}?text=${message}`);
        return;
      }

      // COD (unavailable)
      toast.error('Cash on Delivery is currently unavailable.');
      setIsPlacingOrder(false);
      return;

    } catch (error) {
        console.error('!!! [Checkout] Failed to place order in handlePlaceOrder !!!', error);
        // Log the full error object for more details in browser console
        console.error('Full error object:', error);

        // Display a user-friendly message, potentially including specifics if safe
        let errorMessage = 'There was an error placing your order. Please try again.';
        if (error instanceof Error) {
            // Include the error message from the Error object
            errorMessage += ` Details: ${error.message}`;
        } else if (typeof error === 'string') {
            // If the error is just a string
            errorMessage += ` Details: ${error}`;
        }
        // Avoid showing overly technical details to the user in production
        // but maybe keep error.message for staging/development toasts

        toast.error(errorMessage);
    } finally {
        console.log('[Checkout] Setting isPlacingOrder back to false');
        setIsPlacingOrder(false);
    }
  };

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center md:px-6 lg:py-12">
        <p>Please sign in to checkout.</p>
        <Button asChild className="mt-4">
          <Link href="/sign-in?redirect_url=/checkout">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0 && !isPlacingOrder && !showConfirmation) {
    return (
      <div className="container mx-auto px-4 py-8 text-center md:px-6 lg:py-12">
        <p>Your cart is empty. Redirecting...</p>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <Dialog open={showConfirmation} onOpenChange={(open) => {
        setShowConfirmation(open);
        if (!open) {
          clearCart();
          router.push('/order-history');
        }
      }}>
        <DialogContent className="max-w-md mx-auto text-center">
          <DialogHeader>
            <DialogTitle>Order Confirmed!</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <p className="text-lg font-semibold">Thank you for your purchase.</p>
            {confirmedOrderId && (
              <p className="mt-2 text-sm text-muted-foreground">Order ID: <span className="font-mono font-bold">{confirmedOrderId}</span></p>
            )}
          </div>
          {whatsappUrl && (
            <Button asChild className="mt-2 w-full">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Confirm Payment via WhatsApp
              </a>
            </Button>
          )}
          <DialogFooter>
            <Button onClick={() => {
              setShowConfirmation(false);
              clearCart();
              router.push('/order-history');
            }}>Go to My Orders</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-primary md:text-4xl">
        Checkout
      </h1>

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

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left Side: Address & Payment */}
        <div className="lg:col-span-2">
          {/* Delivery Address Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressForm
                onSubmitSuccess={handleAddressSubmit}
                initialData={addressData || {
                  fullName: '',
                  mobileNumber: '',
                  street: '',
                  landmark: '',
                  city: '',
                  state: '',
                  zip: '',
                  country: 'India'
                }}
              />
            </CardContent>
          </Card>

          {/* Payment Method Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
                className="space-y-4"
                aria-label="Payment methods"
              >
                {/* COD Option */}
                <Label
                  htmlFor="payment-cod"
                  className={`flex cursor-not-allowed items-center gap-4 rounded-lg border p-4 transition-colors bg-gray-100 opacity-60`}
                >
                  <RadioGroupItem value="cod" id="payment-cod" disabled checked={false} />
                  <IndianRupee className="h-6 w-6 text-primary" />
                  <div className="flex-grow">
                    <span className="font-medium">Cash on Delivery (COD)</span>
                    <p className="text-sm text-muted-foreground">COD is currently unavailable.</p>
                  </div>
                  <Truck className="h-6 w-6 text-muted-foreground" />
                </Label>
                {/* WhatsApp payment option */}
                <Label
                  htmlFor="payment-whatsapp"
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50 ${selectedPaymentMethod === 'whatsapp' ? 'border-primary bg-primary/5 ring-2 ring-primary' : ''}`}
                >
                  <RadioGroupItem value="whatsapp" id="payment-whatsapp" disabled={isPlacingOrder} />
                  <img src="/images/whatsapp.png" alt="WhatsApp" width={28} height={28} style={{ borderRadius: '4px' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg'; }} />
                  <div className="flex-grow">
                    <span className="font-medium">Pay via WhatsApp</span>
                    <p className="text-sm text-muted-foreground">Confirm your order and payment via WhatsApp chat.</p>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24"> {/* Make summary sticky */}
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* Cart Items Mini View */}
               <div className="max-h-60 space-y-3 overflow-y-auto pr-2">
                {items.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between gap-2 text-sm">
                    <div className='flex items-center gap-2'>
                     <Image
                        src={item.image}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded border object-cover"
                      />
                      <span className="truncate">{item.name} (x{item.quantity})</span>
                    </div>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <hr className="my-2 border-border" />

              {/* Pricing Details */}
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
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
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={!addressData || !selectedPaymentMethod || isPlacingOrder || items.length === 0}
              >
                {isPlacingOrder ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                    </>
                ) : (
                    `Place Order & Pay ₹${totalAmount.toFixed(2)}`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    </div>
  );
}
