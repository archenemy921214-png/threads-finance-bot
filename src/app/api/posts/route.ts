import { NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const posts = getPosts(status);

    // ハッシュタグをJSON文字列→配列に変換して返す
    const parsed = posts.map((p) => ({
      ...p,
      hashtags: JSON.parse(p.hashtags || '[]'),
    }));

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('GET /api/posts:', err);
    return NextResponse.json({ error: '投稿の取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { theme_id, theme_name, style, body: postBody, cta, hashtags } = body;

    if (!postBody?.trim()) {
      return NextResponse.json({ error: '本文は必須です' }, { status: 400 });
    }
    if (!['short', 'standard', 'passionate'].includes(style)) {
      return NextResponse.json({ error: '無効なスタイルです' }, { status: 400 });
    }

    const post = createPost({
      theme_id: theme_id ?? null,
      theme_name: theme_name ?? null,
      style,
      body: postBody.trim(),
      cta: cta ?? '',
      hashtags: Array.isArray(hashtags) ? hashtags : [],
    });

    return NextResponse.json({ ...post, hashtags: JSON.parse(post.hashtags || '[]') }, { status: 201 });
  } catch (err) {
    console.error('POST /api/posts:', err);
    return NextResponse.json({ error: '投稿の作成に失敗しました' }, { status: 500 });
  }
}
