
// app/api/auth/instagram/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: 'Instagram credentials not configured' },
      { status: 500 }
    );
  }

  // Build Instagram OAuth URL (matching your developer console format)
  const authUrl = new URL('https://www.instagram.com/oauth/authorize');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_manage_insights');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('force_reauth', 'true'); // Optional: force re-auth each time

  // Redirect user to Instagram OAuth (instagram.com, not facebook.com!)
  return NextResponse.redirect(authUrl.toString());
}