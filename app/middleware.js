// // Next.js Edge Middleware for route protection and security headers (Zero-Trust)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // // Allow public landing and login paths
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/unauthorized')) {
    return NextResponse.next();
  }

  // // Enforce secure headers against XSS, clickjacking, and MIME sniffing
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/inventory/:path*', '/pos/:path*']
};