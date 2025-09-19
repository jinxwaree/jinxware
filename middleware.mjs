import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/dash', '/api/admin/:path*']
};

export default function middleware(req) {
  const url = new URL(req.url);
  const auth = req.headers.get('authorization') || '';
  const requires = url.pathname.startsWith('/dash') || url.pathname.startsWith('/api/admin');
  if (!requires) return NextResponse.next();

  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;
  if (!expectedUser || !expectedPass) return NextResponse.next();

  if (!auth.startsWith('Basic ')) {
    return new NextResponse('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Jinxware"' } });
  }
  const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  if (user !== expectedUser || pass !== expectedPass) {
    return new NextResponse('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Jinxware"' } });
  }
  return NextResponse.next();
}
