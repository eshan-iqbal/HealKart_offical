import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product: { id: docSnap.id, ...docSnap.data() } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, description, price, originalPrice, images, category, condition, vintage, stock, isActive } = body;
    if (!name || !description || !price || !originalPrice || !images || !Array.isArray(images) || images.length === 0 || !category || !condition) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
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
    });
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
} 