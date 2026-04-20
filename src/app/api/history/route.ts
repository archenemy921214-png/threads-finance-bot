import { NextResponse } from 'next/server';
import { getHistory } from '@/lib/db';

export async function GET() {
  try {
    const history = getHistory();
    const parsed = history.map((h) => ({
      ...h,
      hashtags: JSON.parse(h.hashtags || '[]'),
    }));
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('GET /api/history:', err);
    return NextResponse.json({ error: '履歴の取得に失敗しました' }, { status: 500 });
  }
}
