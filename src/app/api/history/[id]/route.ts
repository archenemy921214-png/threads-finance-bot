import { NextResponse } from 'next/server';
import { getHistoryItem, updateHistoryItem } from '@/lib/db';

interface Params {
  params: { id: string };
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const id = Number(params.id);

    const existing = getHistoryItem(id);
    if (!existing) return NextResponse.json({ error: '履歴が見つかりません' }, { status: 404 });

    const updated = updateHistoryItem(id, {
      ...(body.likes !== undefined && { likes: Number(body.likes) }),
      ...(body.replies !== undefined && { replies: Number(body.replies) }),
      ...(body.memo !== undefined && { memo: body.memo }),
      ...(body.improvement !== undefined && { improvement: body.improvement }),
    });

    return NextResponse.json({ ...updated, hashtags: JSON.parse(updated?.hashtags || '[]') });
  } catch (err) {
    console.error('PUT /api/history/[id]:', err);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}
