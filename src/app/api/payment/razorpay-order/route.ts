import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt = 'order_rcptid_11' } = body;
    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Razorpay keys not set' }, { status: 500 });
    }
    const orderPayload = {
      amount: Math.round(amount * 100), // rupees to paise
      currency,
      receipt,
    };
    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderPayload),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.description || 'Failed to create order' }, { status: 500 });
    }
    return NextResponse.json({ order_id: data.id });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 