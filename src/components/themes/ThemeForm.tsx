'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import type { Theme } from '@/lib/db';

const CATEGORIES = ['資産形成', '投資制度', '家計管理', '税金', '保険', '節約', '副業', '一般'];

interface ThemeFormProps {
  initial?: Theme | null;
  onSubmit: (data: { name: string; category: string; priority: number }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ThemeForm({ initial, onSubmit, onCancel, loading }: ThemeFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('一般');
  const [priority, setPriority] = useState(3);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setCategory(initial.category);
      setPriority(initial.priority);
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('テーマ名を入力してください');
      return;
    }

    try {
      await onSubmit({ name: name.trim(), category, priority });
    } catch {
      setError('保存に失敗しました。もう一度お試しください。');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* テーマ名 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          テーマ名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：複利の力"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* カテゴリ */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">カテゴリ</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* 優先度 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          優先度: {['', '最低', '低', '中', '高', '最高'][priority]}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>最低</span><span>低</span><span>中</span><span>高</span><span>最高</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* ボタン */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initial ? '更新する' : '追加する'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
