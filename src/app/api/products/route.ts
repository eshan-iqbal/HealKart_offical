import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const q = collection(db, 'products');
    let firestoreQuery = query(q, orderBy('created_at', 'desc'));
    // Filtering (simple, can be extended)
    if (search) {
      // Firestore doesn't support full text search, so this is a simple filter
      // For production, use Algolia or similar
    }
    if (category && category !== 'all') {
      firestoreQuery = query(firestoreQuery, where('category', '==', category));
    }
    if (condition && condition !== 'all') {
      firestoreQuery = query(firestoreQuery, where('condition', '==', condition));
    }
    // Only apply limit if specified
    if (limitParam) {
      const { limit } = await import('firebase/firestore');
      firestoreQuery = query(firestoreQuery, limit(parseInt(limitParam, 10)));
    }
    const snapshot = await getDocs(firestoreQuery);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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