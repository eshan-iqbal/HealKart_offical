import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '@/models/user';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phone, address } = await req.json();
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password, and full name are required.' }, { status: 400 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP email (placeholder)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Your OTP for 1nceMore Registration',
      text: `Hello ${fullName || ''},\n\nThank you for registering with 1nceMore!\n\nYour One-Time Password (OTP) for account verification is: ${otp}\n\nPlease enter this OTP on the verification page to complete your registration.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe 1nceMore Team`,
      html: `<div style="font-family: Poppins, Arial, sans-serif; color: #222;">
        <h2>Welcome to 1nceMore!</h2>
        <p>Hi <strong>${fullName || email}</strong>,</p>
        <p>Thank you for signing up with <b>1nceMore</b>.<br/>
        Your One-Time Password (OTP) for account verification is:</p>
        <div style="font-size: 2rem; font-weight: bold; color: #ff9800; margin: 16px 0;">${otp}</div>
        <p>Please enter this OTP on the verification page to complete your registration.</p>
        <p style="color: #888; font-size: 0.95rem;">If you did not request this, you can safely ignore this email.</p>
        <br/>
        <p>Best regards,<br/>The 1nceMore Team</p>
      </div>`
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, fullName, phone, address, isVerified: false, otp });
    await user.save();

    return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
} 