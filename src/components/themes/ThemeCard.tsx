'use client';

import React from 'react';
import { PriorityBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Theme } from '@/lib/db';

interface ThemeCardProps {
  theme: Theme;
  onEdit: (theme: Theme) => void;
  onDelete: (id: number) => void;
  onGenerate: (theme: Theme) => void;
  generating: boolean;
}

export default function ThemeCard({
  theme,
  onEdit,
  onDelete,
  onGenerate,
  generating,
}: ThemeCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{theme.name}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{theme.category}</p>
        </div>
        <PriorityBadge priority={theme.priority} />
      </div>

      {/* 使用状況 */}
      <div className="mt-4 flex gap-4 text-sm text-gray-500">
        <span>使用回数: <strong className="text-gray-700">{theme.use_count}</strong></span>
        {theme.last_used_at && (
          <span>最終: <strong className="text-gray-700">{theme.last_used_at.slice(0, 10)}</strong></span>
        )}
      </div>

      {/* アクション */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onGenerate(theme)}
          loading={generating}
          className="flex-1"
        >
          投稿を生成
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onEdit(theme)}>
          編集
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm(`「${theme.name}」を削除しますか？`)) onDelete(theme.id);
          }}
          className="text-red-500 hover:bg-red-50"
        >
          削除
        </Button>
      </div>
    </div>
  );
}
