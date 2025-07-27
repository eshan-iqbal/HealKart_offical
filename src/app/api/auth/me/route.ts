import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '@/models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }
    await mongoose.connect(process.env.MONGODB_URI!);
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get user.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: 'Address is required.' }, { status: 400 });
    }
    await mongoose.connect(process.env.MONGODB_URI!);
    const user = await User.findByIdAndUpdate(payload.userId, { address }, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ user, message: 'Address updated successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update address.' }, { status: 500 });
  }
} 