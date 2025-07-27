import React from 'react';

export default function ShippingInfoPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 max-w-2xl animate-fade-in">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary text-center">Shipping Info</h1>
      <p className="mb-4 text-muted-foreground text-center">We offer fast, reliable shipping across India. All orders are processed within 1-2 business days and delivered within 3-7 business days depending on your location.</p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
        <li>Free shipping on orders over ₹999</li>
        <li>Standard shipping fee: ₹49 for orders below ₹999</li>
        <li>Order tracking available for all shipments</li>
        <li>We currently do not offer international shipping</li>
      </ul>
      <p className="text-muted-foreground text-center">For any shipping-related queries, please contact us at <a href="mailto:1ncemore.es@gmail.com" className="text-primary hover:underline">1ncemore.es@gmail.com</a>.</p>
    </div>
  );
} 