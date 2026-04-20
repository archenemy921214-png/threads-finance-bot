'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import PostCard from '@/components/posts/PostCard';
import PostEditor from '@/components/posts/PostEditor';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Post } from '@/lib/db';

type StatusFilter = 'all' | 'draft' | 'approved' | 'archived';

// APIレスポンスではhashtagsが配列になる
type PostWithArray = Omit<Post, 'hashtags'> & { hashtags: string[] };

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'draft', label: '下書き' },
  { value: 'approved', label: '承認済み' },
  { value: 'archived', label: 'アーカイブ' },
];

export default function DraftsPage() {
  const [posts, setPosts] = useState<PostWithArray[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<PostWithArray | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [message, setMessage] = useState('');

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  async function loadPosts() {
    try {
      const url = filter === 'all' ? '/api/posts' : `/api/posts?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed');
      setPosts(await res.json());
    } catch {
      showMessage('投稿の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: number) {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (res.ok) { showMessage('承認しました'); await loadPosts(); }
  }

  async function handleMarkPosted(id: number) {
    if (!confirm('投稿済みにしますか？履歴に移動します。')) return;
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_posted' }),
    });
    if (res.ok) { showMessage('投稿済みに変更しました！履歴に保存されました。'); await loadPosts(); }
  }

  async function handleArchive(id: number) {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' }),
    });
    if (res.ok) { showMessage('アーカイブしました'); await loadPosts(); }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) { showMessage('削除しました'); await loadPosts(); }
  }

  async function handleSave(
    id: number,
    data: { body: string; cta: string; hashtags: string[] }
  ) {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      setEditTarget(null);
      showMessage('保存しました');
      await loadPosts();
    } finally {
      setEditLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadPosts();
  }, [filter]);

  // PostWithArray → Post変換（PostCardはPost型を期待するが、実際はhashtagsが配列）
  function toCardPost(p: PostWithArray): Post {
    return { ...p, hashtags: JSON.stringify(p.hashtags) };
  }

  return (
    <div>
      <Header
        title="投稿候補"
        subtitle="生成された投稿案を確認・編集・承認します"
        actions={message ? <span className="text-sm text-green-600">{message}</span> : undefined}
      />

      {/* フィルター */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400">
            {filter === 'all' ? '投稿候補がありません' : `${STATUS_FILTERS.find(f => f.value === filter)?.label}の投稿がありません`}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            テーマページから「投稿を生成」してみましょう
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={toCardPost(post)}
              onApprove={post.status === 'draft' ? handleApprove : undefined}
              onMarkPosted={post.status === 'approved' ? handleMarkPosted : undefined}
              onArchive={post.status !== 'archived' ? handleArchive : undefined}
              onDelete={handleDelete}
              onEdit={() => setEditTarget(post)}
            />
          ))}
        </div>
      )}

      {/* 編集モーダル */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="投稿を編集"
        maxWidth="max-w-2xl"
      >
        {editTarget && (
          <PostEditor
            post={toCardPost(editTarget)}
            onSave={handleSave}
            onCancel={() => setEditTarget(null)}
            loading={editLoading}
          />
        )}
      </Modal>
    </div>
  );
}
