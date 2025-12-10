import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl; const hostname = request.headers.get('host') || '';

    // Define allowed domains (localhost for dev, your production domain for prod)
    // The admin panel is hosted at panelpro.onradio.com.ar
    // Radio subdomains are like: radio1.onradio.com.ar
    const adminHost = process.env.NODE_ENV === 'production'
        ? 'panelpro.onradio.com.ar' // Admin panel domain
        : 'localhost:3000';

    const radioBaseDomain = 'onradio.com.ar'; // Base domain for radio subdomains

    // Check if we are on the admin panel domain
    const isAdminDomain = hostname === adminHost || hostname.includes(adminHost);

    // Check if we are on a radio subdomain
    let subdomain = null;

    if (!isAdminDomain && hostname.includes(radioBaseDomain)) {
        const parts = hostname.replace(`.${radioBaseDomain}`, '').split('.');
        if (parts.length > 0 && parts[0] !== 'www' && parts[0] !== hostname && parts[0] !== 'panelpro') {
            subdomain = parts[0];
        }
    }

    // Special case for localhost testing with subdomains (e.g. test.localhost:3000)
    if (process.env.NODE_ENV !== 'production' && hostname.includes('.localhost') && !hostname.startsWith('localhost')) {
        subdomain = hostname.split('.')[0];
    }

    // If there is a subdomain, rewrite to the public player
    if (subdomain) {
        // Prevent rewriting for static files or API routes if needed, 
        // though usually API routes might need to be accessible via subdomain too.
        // For now, we rewrite everything except _next and static files.
        if (!url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api/upload')) {
            // We rewrite the URL to the internal route
            // Note: API calls from the client will also be rewritten if they are relative.
            // If the page calls /api/config, it becomes /public-player/[subdomain]/api/config which doesn't exist.
            // We need to handle API routes carefully or ensure the client uses absolute URLs or the middleware handles them.

            // Strategy: Rewrite page requests to /public-player/[subdomain]
            // Keep API requests as is? No, API requests might need the subdomain context.

            // Let's rewrite ONLY the root path "/" and maybe others to the player
            if (url.pathname === '/') {
                return NextResponse.rewrite(new URL(`/public-player/${subdomain}`, request.url));
            }
        }
    } else {
        // Main Domain (Admin Panel) - Protect Routes
        const isPublicPath =
            url.pathname === '/login' ||
            url.pathname.startsWith('/api/auth') ||
            url.pathname.startsWith('/_next') ||
            url.pathname.startsWith('/static') ||
            url.pathname.startsWith('/favicon.ico') ||
            url.pathname.startsWith('/public-player'); // Allow direct access to public player just in case

        if (!isPublicPath) {
            // Verify Authentication
            const token = await getToken({ req: request });
            if (!token) {
                const loginUrl = new URL('/login', request.url);
                // Optional: seamless redirect back
                // loginUrl.searchParams.set('callbackUrl', url.pathname); 
                return NextResponse.redirect(loginUrl);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
