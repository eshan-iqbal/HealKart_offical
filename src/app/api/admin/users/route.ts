import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@/models/user';

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

// GET - Get all users (admin only)
export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);
    const users = await User.find({}).select('-password -otp');
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}

// POST - Create new admin user (admin only)
export async function POST(req: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { email, password, fullName, phone, address, role } = await req.json();
    
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password, and full name are required.' }, { status: 400 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      phone,
      address,
      role: role || 'user',
      isVerified: true // Admin-created users are automatically verified
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt
    };

    return NextResponse.json({ 
      message: 'User created successfully.',
      user: userResponse 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
} 