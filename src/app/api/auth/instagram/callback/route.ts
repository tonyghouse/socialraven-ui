// app/api/auth/instagram/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Instagram OAuth error:', { error, errorReason, errorDescription });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${error}&reason=${errorReason}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=no_code`
    );
  }

  try {
    // Get auth token (assuming you store JWT in cookie or header)
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=unauthorized`
      );
    }

    // Send code to your Spring backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/social/instagram/callback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ code }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to connect Instagram');
    }

    // Success! Redirect to dashboard
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?instagram=connected`
    );
  } catch (error) {
    console.error('Instagram callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=connection_failed`
    );
  }
}