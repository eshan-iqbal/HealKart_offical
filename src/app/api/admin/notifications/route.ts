import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import clientPromise from '@/lib/mongodb';
import User from '@/models/user';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Helper function to verify admin token
async function verifyAdminToken(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await mongoose.connect(process.env.MONGODB_URI!);
    const user = await User.findById(decoded.userId);
    return user?.role === 'admin' ? user : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db('healkart');
    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    const notifications = orders.map((order: any) => ({
      orderId: order._id,
      userEmail: order.userEmail,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    }));
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications.' }, { status: 500 });
  }
} 