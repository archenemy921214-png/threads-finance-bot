import { NextResponse } from 'next/server';
import { generatePosts } from '@/lib/ai';
import { createPost, getTheme } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { themeId, themeName, category } = body;

    if (!themeName?.trim()) {
      return NextResponse.json({ error: 'テーマ名は必須です' }, { status: 400 });
    }

    // AI（またはテンプレート）で3パターン生成
    const generated = await generatePosts(themeName, category ?? '一般');

    // DBに下書きとして保存
    const styles = ['short', 'standard', 'passionate'] as const;
    const savedPosts = [];

    for (const style of styles) {
      const data = generated[style];
      const post = createPost({
        theme_id: themeId ? Number(themeId) : null,
        theme_name: themeName,
        style,
        body: data.body,
        cta: data.cta,
        hashtags: data.hashtags,
      });
      savedPosts.push({ ...post, hashtags: JSON.parse(post.hashtags || '[]') });
    }

    return NextResponse.json({ posts: savedPosts }, { status: 201 });
  } catch (err) {
    console.error('POST /api/generate:', err);
    return NextResponse.json({ error: '投稿の生成に失敗しました' }, { status: 500 });
  }
}
