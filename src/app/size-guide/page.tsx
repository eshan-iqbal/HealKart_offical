import React from 'react';

export default function SizeGuidePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 max-w-2xl animate-fade-in">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary text-center">Size Guide</h1>
      <p className="mb-4 text-muted-foreground text-center">Find your perfect fit! Our thrifted pieces come in a variety of sizes. Please refer to the measurements below and feel free to contact us if you have any questions.</p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
        <li>All measurements are in inches</li>
        <li>Chest/Bust: Measure around the fullest part</li>
        <li>Waist: Measure around the narrowest part</li>
        <li>Hips: Measure around the widest part</li>
        <li>For best fit, compare measurements with a similar item you own</li>
      </ul>
      <p className="text-muted-foreground text-center">Still unsure? Email us at <a href="mailto:1ncemore.es@gmail.com" className="text-primary hover:underline">1ncemore.es@gmail.com</a> for personalized sizing help.</p>
    </div>
  );
} 