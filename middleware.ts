import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply internationalization middleware first
  const response = intlMiddleware(request);
  
  // For PWA, we'll handle authentication redirects on the client side
  // This middleware focuses on internationalization only
  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/',
    '/(nl|en)/:path*',
  ]
};
