import { NextResponse } from 'next/server';
import { getPost, updatePost, deletePost, markAsPosted } from '@/lib/db';

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const post = getPost(Number(params.id));
    if (!post) return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 });
    return NextResponse.json({ ...post, hashtags: JSON.parse(post.hashtags || '[]') });
  } catch (err) {
    console.error('GET /api/posts/[id]:', err);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const postId = Number(params.id);

    const existing = getPost(postId);
    if (!existing) return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 });

    // 「投稿済み」にする場合は履歴に移動
    if (body.action === 'mark_posted') {
      const historyId = markAsPosted(postId);
      return NextResponse.json({ historyId });
    }

    const updated = updatePost(postId, {
      ...(body.body !== undefined && { body: body.body }),
      ...(body.cta !== undefined && { cta: body.cta }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.hashtags !== undefined && { hashtags: body.hashtags }),
    });

    return NextResponse.json({ ...updated, hashtags: JSON.parse(updated?.hashtags || '[]') });
  } catch (err) {
    console.error('PUT /api/posts/[id]:', err);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const existing = getPost(Number(params.id));
    if (!existing) return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 });

    deletePost(Number(params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/posts/[id]:', err);
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}
