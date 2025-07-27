// app/layout.tsx
// import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from '@/components/ui/toaster';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: '1nceMore - Thrifted Treasures',
  description: 'Discover unique vintage and pre-loved fashion pieces. Give pre-loved clothes a second life with 1nceMore.',
  keywords: 'thrifted clothes, vintage fashion, sustainable fashion, pre-loved clothing, eco-friendly fashion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins">
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
