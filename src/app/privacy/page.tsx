import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 max-w-2xl animate-fade-in">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary text-center">Privacy Policy</h1>
      <p className="mb-4 text-muted-foreground text-center">Your privacy is important to us. We are committed to protecting your personal information and being transparent about how we use it.</p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
        <li>We only collect information necessary to process your orders and provide customer support</li>
        <li>Your data is never sold or shared with third parties for marketing</li>
        <li>All payment information is securely processed by trusted payment providers</li>
        <li>You can contact us at any time to request deletion of your data</li>
      </ul>
      <p className="text-muted-foreground text-center">For questions about our privacy practices, email <a href="mailto:1ncemore.es@gmail.com" className="text-primary hover:underline">1ncemore.es@gmail.com</a>.</p>
    </div>
  );
} 