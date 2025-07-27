import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const protectedRoutes = [
  '/admin',
  '/orders',
  '/order-history',
  '/cart',
  '/checkout',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Only apply middleware to protected routes
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  
  // If no token, redirect to sign-in
  if (!token) {
    console.log(`Middleware: No token found, redirecting from ${pathname} to /sign-in`);
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(url);
  }

  // Log token details for debugging
  console.log(`Middleware: Token found for ${pathname}, length: ${token.length}`);
  console.log(`Middleware: JWT_SECRET is set: ${!!JWT_SECRET}`);
  
  try {
    // Verify token using jose (Edge Runtime compatible)
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    console.log(`Middleware: Token valid for ${pathname}, userId: ${payload.userId}, role: ${payload.role}`);
    return NextResponse.next();
  } catch (error) {
    console.log(`Middleware: Invalid token for ${pathname}, error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*', '/order-history/:path*', '/cart/:path*', '/checkout/:path*'],
};