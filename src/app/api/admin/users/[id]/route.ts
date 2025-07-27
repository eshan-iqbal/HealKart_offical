import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User, { IUser } from '@/models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Helper function to verify admin token
async function verifyAdminToken(req: NextRequest): Promise<IUser | null> {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await mongoose.connect(process.env.MONGODB_URI!);
    const user: IUser | null = await User.findById(decoded.userId);
    return user?.role === 'admin' ? user : null;
  } catch {
    return null;
  }
}

// Add type guard for IUser
function isIUser(obj: any): obj is IUser {
  return obj && typeof obj === 'object' && typeof obj._id !== 'undefined';
}

// PUT - Update user role (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser: IUser | null = await verifyAdminToken(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { role } = await req.json();
    
    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Valid role (user or admin) is required.' }, { status: 400 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Await params
    const { id } = await params;
    const user: IUser | null = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if ((user._id as any).toString() === (adminUser._id as any).toString()) {
      return NextResponse.json({ error: 'Cannot change your own role.' }, { status: 400 });
    }

    // Update user role
    user.role = role;
    await user.save();

    // Return updated user without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    return NextResponse.json({ 
      message: 'User role updated successfully.',
      user: userResponse 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user role.' }, { status: 500 });
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser: IUser | null = await verifyAdminToken(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Await params
    const { id } = await params;
    const user: IUser | null = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if ((user._id as any).toString() === (adminUser._id as any).toString()) {
      return NextResponse.json({ error: 'Cannot delete your own account.' }, { status: 400 });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
} 