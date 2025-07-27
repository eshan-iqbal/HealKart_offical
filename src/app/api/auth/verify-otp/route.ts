import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/user';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }
    await mongoose.connect(process.env.MONGODB_URI!);
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 401 });
    }
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    return NextResponse.json({ message: 'Account verified successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'OTP verification failed.' }, { status: 500 });
  }
} 