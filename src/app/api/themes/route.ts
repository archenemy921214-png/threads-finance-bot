import { NextResponse } from 'next/server';
import { getThemes, createTheme } from '@/lib/db';

export async function GET() {
  try {
    const themes = getThemes();
    return NextResponse.json(themes);
  } catch (err) {
    console.error('GET /api/themes:', err);
    return NextResponse.json({ error: 'テーマの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, priority } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'テーマ名は必須です' }, { status: 400 });
    }

    const theme = createTheme({
      name: name.trim(),
      category: category ?? '一般',
      priority: Number(priority) || 3,
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (err) {
    console.error('POST /api/themes:', err);
    return NextResponse.json({ error: 'テーマの作成に失敗しました' }, { status: 500 });
  }
}
