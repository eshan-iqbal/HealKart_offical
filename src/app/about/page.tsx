import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 max-w-3xl animate-fade-in">
      <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary text-center">About 1nceMore</h1>
      <p className="mb-10 text-lg text-muted-foreground text-center">
        1nceMore is your trusted destination for sustainable, thrifted, and vintage fashion. Based in Kulgam, Jammu & Kashmir, we are passionate about giving pre-loved clothes a second life and making unique style accessible to everyone.
      </p>

      <div className="grid gap-8 md:grid-cols-2 mb-10">
        <Card className="shadow-md border-primary/20 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Promote eco-friendly and sustainable fashion</li>
              <li>Offer high-quality, curated thrifted pieces</li>
              <li>Support conscious consumerism and reduce textile waste</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-md border-primary/20 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Why Choose Us?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Carefully selected, quality-checked items</li>
              <li>Affordable prices for all</li>
              <li>Fast, reliable shipping across India</li>
              <li>Friendly customer support</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-primary/30 bg-primary/5 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li><span className="font-medium">Email:</span> 1ncemore.es@gmail.com</li>
            <li><span className="font-medium">Phone:</span> +91-6006223504, +91-6005280251</li>
            <li><span className="font-medium">Instagram:</span> <a href="https://instagram.com/1ncemore__" target="_blank" rel="noopener noreferrer" className="hover:underline">@1ncemore__</a></li>
            <li><span className="font-medium">Address:</span> Kulgam Jammu & Kashmir, 192231</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 