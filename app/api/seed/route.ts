import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { ensureDatabaseSeeded } from '@/lib/seed';

export async function GET(_req: NextRequest) {
  try {
    const db = await dbConnect();
    if (!db) {
      return NextResponse.json({
        success: false,
        message: 'MongoDB is not connected. Operating in mock fallback mode.',
      });
    }

    const counts = await ensureDatabaseSeeded(true);
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with all platform sample collections.',
      counts,
    });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal seed error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
