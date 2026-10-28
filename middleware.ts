import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export default auth((req) => {
	const { pathname } = req.nextUrl;

	if (pathname.startsWith('/api/admin')) {
		if (!req.auth?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		return NextResponse.next();
	}

	if (pathname.startsWith('/admin') && !req.auth?.user) {
		const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin);
		signInUrl.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
});

export const config = {
	matcher: ['/admin/:path*', '/api/admin/:path*']
};
