import React from 'react';

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 max-w-2xl animate-fade-in">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary text-center">Returns & Exchanges</h1>
      <p className="mb-4 text-muted-foreground text-center">We want you to love your purchase! If you're not satisfied, you can return or exchange your item within 7 days of delivery.</p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
        <li>Items must be unused and in original condition</li>
        <li>Contact us at <a href="mailto:1ncemore.es@gmail.com" className="text-primary hover:underline">1ncemore.es@gmail.com</a> to initiate a return or exchange</li>
        <li>Refunds are processed within 5-7 business days after we receive your return</li>
        <li>Return shipping costs are the responsibility of the customer unless the item is defective</li>
      </ul>
      <p className="text-muted-foreground text-center">For more details, please read our <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.</p>
    </div>
  );
} 