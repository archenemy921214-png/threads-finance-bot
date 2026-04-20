import { NextResponse } from 'next/server';
import { seedData } from '@/lib/db';

export async function POST() {
  try {
    seedData();
    return NextResponse.json({ success: true, message: 'サンプルデータを投入しました' });
  } catch (err) {
    console.error('POST /api/seed:', err);
    return NextResponse.json({ error: 'サンプルデータの投入に失敗しました' }, { status: 500 });
  }
}
