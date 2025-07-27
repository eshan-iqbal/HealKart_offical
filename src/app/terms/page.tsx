import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 max-w-2xl animate-fade-in">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary text-center">Terms of Service</h1>
      <p className="mb-4 text-muted-foreground text-center">By using 1nceMore, you agree to our terms and conditions. Please read them carefully.</p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
        <li>All sales are final unless otherwise stated in our Returns Policy</li>
        <li>We reserve the right to update our terms at any time</li>
        <li>Use of our website and services is at your own risk</li>
        <li>For questions, contact us at <a href="mailto:1ncemore.es@gmail.com" className="text-primary hover:underline">1ncemore.es@gmail.com</a></li>
      </ul>
      <p className="text-muted-foreground text-center">Thank you for choosing 1nceMore!</p>
    </div>
  );
} 