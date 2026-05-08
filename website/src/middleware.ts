import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard'];
const REGISTER  = ['/register/type', '/register/kyc'];

export function middleware(req: NextRequest) {
  const access  = req.cookies.get('access_token')?.value;
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED.some(p => pathname.startsWith(p));
  const needsReg  = REGISTER.some(p => pathname.startsWith(p));

  if ((needsAuth || needsReg) && !access) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/register/:path*'],
};
