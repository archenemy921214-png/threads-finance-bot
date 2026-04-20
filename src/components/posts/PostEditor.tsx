'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { StyleBadge } from '@/components/ui/Badge';
import type { Post } from '@/lib/db';

interface PostEditorProps {
  post: Post;
  onSave: (id: number, data: { body: string; cta: string; hashtags: string[] }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PostEditor({ post, onSave, onCancel, loading }: PostEditorProps) {
  const [body, setBody] = useState('');
  const [cta, setCta] = useState('');
  const [hashtagsStr, setHashtagsStr] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setBody(post.body);
    setCta(post.cta);
    const tags: string[] = JSON.parse(post.hashtags || '[]');
    setHashtagsStr(tags.join(' '));
  }, [post]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!body.trim()) {
      setError('本文を入力してください');
      return;
    }

    const hashtags = hashtagsStr
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    try {
      await onSave(post.id, { body: body.trim(), cta: cta.trim(), hashtags });
    } catch {
      setError('保存に失敗しました。もう一度お試しください。');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <StyleBadge style={post.style} />
        {post.theme_name && <span>📌 {post.theme_name}</span>}
      </div>

      {/* 本文 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          本文 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="投稿本文を入力..."
        />
        <p className="mt-1 text-right text-xs text-gray-400">{body.length}文字</p>
      </div>

      {/* CTA */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">CTA</label>
        <input
          type="text"
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="行動を促す一言..."
        />
      </div>

      {/* ハッシュタグ */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ハッシュタグ（スペース区切り）
        </label>
        <input
          type="text"
          value={hashtagsStr}
          onChange={(e) => setHashtagsStr(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="#お金の勉強 #投資初心者 #資産形成"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          保存する
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
