import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('GET /api/stats:', err);
    return NextResponse.json({ error: '統計の取得に失敗しました' }, { status: 500 });
  }
}
