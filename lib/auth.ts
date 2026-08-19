import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET ?? 'devops-resource-platform-secret-key-2026';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): { userId: string; role: string } | null {
  try {
    // 1. Try to get token from cookies
    const cookieToken = req.cookies.get('token')?.value;
    if (cookieToken) {
      const decoded = verifyToken(cookieToken);
      if (decoded) return decoded;
    }

    // 2. Try to get token from Authorization header (Bearer <token>)
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const headerToken = authHeader.substring(7);
      const decoded = verifyToken(headerToken);
      if (decoded) return decoded;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Higher-Order Function (HOC) to protect Next.js API Route Handlers.
 * Enforces authentication and checks if the user's role is in the allowed list.
 * Injecting the decoded user object directly as the second argument.
 * 
 * College Viva Tip:
 * "This is a Higher-Order Function (HOC) that wraps standard API route handlers.
 * It intercepts requests, validates the JWT, checks the user's role against 
 * allowed roles, and returns a 401 (Unauthenticated) or 403 (Unauthorized/Forbidden)
 * response. If authorized, it passes control to the actual route handler."
 */
export function requireRole(
  allowedRoles: string[],
  handler: (req: NextRequest, user: { userId: string; role: string }) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse>;

export function requireRole<T>(
  allowedRoles: string[],
  handler: (req: NextRequest, user: { userId: string; role: string }, context: T) => Promise<NextResponse>
): (req: NextRequest, context: T) => Promise<NextResponse>;

export function requireRole<T>(
  allowedRoles: string[],
  handler: (req: NextRequest, user: { userId: string; role: string }, context?: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: T) => {
    // Extract and verify user details from request
    const user = getUserFromRequest(req);

    // Reject if unauthenticated
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Reject if unauthorized
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delegate execution to original handler
    return handler(req, user, context as T);
  };
}
