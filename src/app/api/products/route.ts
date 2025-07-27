import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  category: string;
  condition: string;
  vintage: boolean;
  stock: number;
  isActive: boolean;
  rating?: number;
  reviews?: number;
  badge?: string;
  created_at?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    
    // Simplified query to avoid index issues
    let firestoreQuery = query(collection(db, 'products'));
    
    // Apply limit if specified
    if (limitParam) {
      const { limit } = await import('firebase/firestore');
      firestoreQuery = query(firestoreQuery, limit(parseInt(limitParam, 10) * 2)); // Get more to filter client-side
    }
    
    const snapshot = await getDocs(firestoreQuery);
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    
    // Apply filters client-side
    if (category && category !== 'all') {
      products = products.filter(product => product.category?.toLowerCase() === category.toLowerCase());
    }
    if (condition && condition !== 'all') {
      products = products.filter(product => product.condition?.toLowerCase() === condition.toLowerCase());
    }
    if (search) {
      products = products.filter(product => 
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort by creation date client-side
    products.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
    
    // Apply final limit
    if (limitParam) {
      products = products.slice(0, parseInt(limitParam, 10));
    }
    
    return NextResponse.json({ products, total: products.length, page: 1, limit: limitParam ? parseInt(limitParam, 10) : products.length });
  } catch (error) {
    console.error('API /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, originalPrice, images, category, condition, vintage, stock, isActive } = body;
    if (!name || !description || !price || !originalPrice || !images || !Array.isArray(images) || images.length === 0 || !category || !condition) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const docRef = await addDoc(collection(db, 'products'), {
      name,
      description,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice),
      images,
      category,
      condition,
      vintage: Boolean(vintage),
      stock: parseInt(stock) || 1,
      isActive: Boolean(isActive),
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ id: docRef.id, message: 'Product created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
} 