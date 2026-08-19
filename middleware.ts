import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Cryptographically verifies a JWT signature on the Edge Runtime.
 * 
 * College Viva Tip:
 * "Next.js Middleware runs inside the Edge Runtime which does not support Node.js core
 * modules like 'crypto' (needed by packages like 'jsonwebtoken'). To avoid runtime crashes,
 * I wrote this helper using the standard Web Crypto API (crypto.subtle) which is natively
 * supported in Edge and browser environments."
 */
async function verifyJwtAtEdge(token: string, secret: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Recreate signature verification input string
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    // 2. Import the raw secret into Web Crypto HMAC key
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // 3. Convert signature from Base64Url back to standard base64 and bytes
    const base64url = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64url.length % 4)) % 4;
    const base64 = base64url + '='.repeat(padLen);
    const signatureBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // 4. Verify HMAC SHA-256 signature
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, data);
    if (!isValid) return null;

    // 5. Decode payload
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);

    // 6. Check expiry
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Edge JWT Verification Error:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Intercept dashboard requests to enforce auth
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token || !JWT_SECRET) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const decoded = await verifyJwtAtEdge(token, JWT_SECRET);
    if (!decoded) {
      // If token is invalid or expired, clear it and redirect to login
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// Only match /dashboard paths and subpaths
export const config = {
  matcher: ['/dashboard/:path*'],
};
