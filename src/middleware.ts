import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/downloads(.*)',
  '/docs/agency-custom-pricing-sheet(.*)',
  '/privacy-policy',
  '/refund-policy',
  '/terms-of-service',
  '/about',
  '/blog(.*)',
  '/careers',
  '/contact',
  '/changelog',
  '/invite',
  '/review(.*)',
  '/reports(.*)',
  '/client-connect(.*)',
  '/meta/data-deletion',
  '/api/client-connect(.*)',
  '/api/auth/x/callback',
  '/api/auth/linkedin/callback',
  '/api/auth/youtube/callback',
  '/api/auth/instagram/callback',
  '/api/auth/facebook/callback',
  '/api/auth/threads/callback',
  '/api/auth/tiktok/callback',
  '/api/meta/threads/uninstall',
  '/api/meta/threads/delete',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
