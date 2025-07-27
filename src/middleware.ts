import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Only run logic for the admin page
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

  // Allow all other requests to pass through
  return NextResponse.next();
}
