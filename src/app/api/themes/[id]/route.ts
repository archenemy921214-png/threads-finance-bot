import { NextResponse } from 'next/server';
import { getTheme, updateTheme, deleteTheme } from '@/lib/db';

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const theme = getTheme(Number(params.id));
    if (!theme) return NextResponse.json({ error: 'テーマが見つかりません' }, { status: 404 });
    return NextResponse.json(theme);
  } catch (err) {
    console.error('GET /api/themes/[id]:', err);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const { name, category, priority } = body;

    const existing = getTheme(Number(params.id));
    if (!existing) return NextResponse.json({ error: 'テーマが見つかりません' }, { status: 404 });

    const updated = updateTheme(Number(params.id), {
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category }),
      ...(priority !== undefined && { priority: Number(priority) }),
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/themes/[id]:', err);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const existing = getTheme(Number(params.id));
    if (!existing) return NextResponse.json({ error: 'テーマが見つかりません' }, { status: 404 });

    deleteTheme(Number(params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/themes/[id]:', err);
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}
