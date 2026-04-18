import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role;

    // Super admin can access everything
    if (role === 'SUPER_ADMIN') {
      // Redirect /dashboard to super admin dashboard
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/superadmin/dashboard', req.url));
      }
      // Super admin can access doctor/patient/superadmin/studio routes
      return NextResponse.next();
    }

    // Redirect based on role after login
    if (pathname === '/dashboard') {
      if (role === 'DOCTOR') return NextResponse.redirect(new URL('/doctor/dashboard', req.url));
      if (role === 'PATIENT') return NextResponse.redirect(new URL('/patient/dashboard', req.url));
    }

    // Protect super admin routes
    if (pathname.startsWith('/superadmin')) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    // Protect doctor routes
    if (pathname.startsWith('/doctor') && role !== 'DOCTOR') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    // Protect patient routes
    if (pathname.startsWith('/patient') && role !== 'PATIENT') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public paths — accessible without login
        const publicPaths = [
          '/',
          '/login',
          '/signup',
          '/blog',
          '/privacy',
          '/terms',
          '/refund',
          '/api/auth',
          '/api/packages',
          '/api/availability',
          '/api/doctor/profile',
          '/api/services',
          '/api/products',
          '/products',
          '/api/videos',
          '/api/site-settings',
          '/api/theme',
          '/services',
          '/studio',
          '/forgot-password',
          '/reset-password',
          '/api/contact',
        ];
        const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p));
        if (isPublic) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
