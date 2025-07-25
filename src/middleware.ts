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

  // If the hostname ends with a vercel.app suffix, it's the main app, not a custom domain
  if (hostname.endsWith('.vercel.app')) {
    return NextResponse.next();
  }

  // Otherwise, rewrite to our render page for custom domains
  url.pathname = `/render-domain`;
  return NextResponse.rewrite(url);
}