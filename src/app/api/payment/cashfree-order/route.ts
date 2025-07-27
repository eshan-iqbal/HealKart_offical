import { NextRequest, NextResponse } from 'next/server';

const APP_ID = process.env.CASHFREE_APP_ID!;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const BASE_URL = 'https://sandbox.cashfree.com/pg';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderAmount, customerName, customerEmail, customerPhone, returnUrl } = body;
    if (!orderId || !orderAmount || !customerName || !customerEmail || !customerPhone || !returnUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const url = `${BASE_URL}/orders`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-version': '2022-09-01',
      'x-client-id': APP_ID,
      'x-client-secret': SECRET_KEY,
    };
    const payload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: orderId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: returnUrl,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.order_id) {
      return NextResponse.json({ error: data.message || 'Failed to create Cashfree order', details: data }, { status: 500 });
    }
    // Return the hosted payment page link for customer redirection
    return NextResponse.json({
      paymentLink: `${BASE_URL}/orders/${data.order_id}/pay`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create Cashfree order' }, { status: 500 });
  }
} 