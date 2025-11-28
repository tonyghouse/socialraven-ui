import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: 'Facebook credentials not configured' },
      { status: 500 }
    );
  }

  // Build Facebook OAuth URL
  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,public_profile');
  authUrl.searchParams.set('response_type', 'code');

  // Redirect user to Facebook OAuth
  return NextResponse.redirect(authUrl.toString());
}