import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host')!;

  // Your main app runs on this host
  const appHost = new URL(process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000').hostname;
  
  // Handle requests to the admin panel
  if (url.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      if (user === 'admin' && pwd === 'password') {
        return NextResponse.next();
      }
    }
    return new NextResponse('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
  }

  // If the request is for a custom domain, rewrite to our render page
  if (hostname !== appHost) {
    url.pathname = `/render-domain`;
    return NextResponse.rewrite(url);
  }

  // Allow all other requests to go through
  return NextResponse.next();
}