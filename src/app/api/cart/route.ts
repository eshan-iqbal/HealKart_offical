import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '@/models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    await mongoose.connect(process.env.MONGODB_URI!);
    const user = await User.findById(payload.userId);
    return user;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  return NextResponse.json({ cart: user.cart || [] });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { cart } = await req.json();
  user.cart = Array.isArray(cart) ? cart : [];
  await user.save();
  return NextResponse.json({ cart: user.cart });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const { item, action } = await req.json();
  if (!item || !item.id) return NextResponse.json({ error: 'Invalid item.' }, { status: 400 });
  let updated = false;
  // Ensure user.cart is always an array
  if (!Array.isArray(user.cart)) user.cart = [];
  if (action === 'add') {
    const existing = user.cart.find((i: any) => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      user.cart.push(item);
    }
    updated = true;
  } else if (action === 'update') {
    user.cart = user.cart.map((i: any) => i.id === item.id ? { ...i, ...item } : i);
    updated = true;
  } else if (action === 'remove') {
    user.cart = user.cart.filter((i: any) => i.id !== item.id);
    updated = true;
  }
  if (updated) await user.save();
  return NextResponse.json({ cart: user.cart });
} 