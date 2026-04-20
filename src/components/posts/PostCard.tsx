'use client';

import React, { useState } from 'react';
import { StyleBadge, StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Post } from '@/lib/db';

interface PostCardProps {
  post: Post;
  onApprove?: (id: number) => void;
  onMarkPosted?: (id: number) => void;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (post: Post) => void;
}

export default function PostCard({
  post,
  onApprove,
  onMarkPosted,
  onArchive,
  onDelete,
  onEdit,
}: PostCardProps) {
  const [copied, setCopied] = useState(false);
  const hashtags: string[] = JSON.parse(post.hashtags || '[]');

  async function copyToClipboard() {
    const text = `${post.body}\n\n${post.cta}\n\n${hashtags.join(' ')}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      {/* ヘッダー */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StyleBadge style={post.style} />
          <StatusBadge status={post.status} />
        </div>
        {post.theme_name && (
          <span className="text-xs text-gray-400">📌 {post.theme_name}</span>
        )}
      </div>

      {/* 本文 */}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{post.body}</p>

      {/* CTA */}
      <p className="mt-3 text-sm font-medium text-blue-600">→ {post.cta}</p>

      {/* ハッシュタグ */}
      <div className="mt-2 flex flex-wrap gap-1">
        {hashtags.map((tag, i) => (
          <span key={i} className="text-xs text-blue-500">{tag}</span>
        ))}
      </div>

      {/* アクション */}
      <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-gray-500"
        >
          {copied ? '✓ コピー済み' : 'コピー'}
        </Button>

        {onEdit && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(post)}>
            編集
          </Button>
        )}

        {post.status === 'draft' && onApprove && (
          <Button variant="primary" size="sm" onClick={() => onApprove(post.id)}>
            承認する
          </Button>
        )}

        {post.status === 'approved' && onMarkPosted && (
          <Button variant="primary" size="sm" onClick={() => onMarkPosted(post.id)}>
            投稿済みにする
          </Button>
        )}

        {post.status !== 'archived' && post.status !== 'posted' && onArchive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(post.id)}
            className="text-yellow-600 hover:bg-yellow-50"
          >
            アーカイブ
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('この投稿を削除しますか？')) onDelete(post.id);
            }}
            className="ml-auto text-red-500 hover:bg-red-50"
          >
            削除
          </Button>
        )}
      </div>
    </div>
  );
}
