import React from 'react';

export default function SustainabilityPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 max-w-2xl animate-fade-in">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary text-center">Sustainability</h1>
      <p className="mb-4 text-muted-foreground text-center">At 1nceMore, sustainability is at the heart of everything we do. We believe in making fashion better for people and the planet.</p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
        <li>We promote the reuse of clothing to reduce textile waste</li>
        <li>Our packaging is recyclable and eco-friendly</li>
        <li>We support local communities and ethical sourcing</li>
        <li>We encourage conscious consumerism and mindful shopping</li>
      </ul>
      <p className="text-muted-foreground text-center">Join us in making a positive impact—one thrifted piece at a time!</p>
    </div>
  );
} 