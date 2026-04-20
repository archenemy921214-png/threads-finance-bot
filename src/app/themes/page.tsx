'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import ThemeCard from '@/components/themes/ThemeCard';
import ThemeForm from '@/components/themes/ThemeForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Theme } from '@/lib/db';

export default function ThemesPage() {
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Theme | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  async function loadThemes() {
    try {
      const res = await fetch('/api/themes');
      if (!res.ok) throw new Error('Failed');
      setThemes(await res.json());
    } catch {
      showMessage('テーマの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleSubmit(data: { name: string; category: string; priority: number }) {
    setFormLoading(true);
    try {
      const url = editTarget ? `/api/themes/${editTarget.id}` : '/api/themes';
      const method = editTarget ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      showMessage(editTarget ? 'テーマを更新しました' : 'テーマを追加しました');
      setIsFormOpen(false);
      setEditTarget(null);
      await loadThemes();
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/themes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showMessage('テーマを削除しました');
      await loadThemes();
    }
  }

  async function handleGenerate(theme: Theme) {
    setGeneratingId(theme.id);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: theme.id,
          themeName: theme.name,
          category: theme.category,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      showMessage('3パターンの投稿を生成しました！投稿候補ページを確認してください。');
      router.push('/drafts');
    } catch {
      showMessage('生成に失敗しました。もう一度お試しください。');
    } finally {
      setGeneratingId(null);
    }
  }

  useEffect(() => { loadThemes(); }, []);

  return (
    <div>
      <Header
        title="テーマ管理"
        subtitle="投稿のテーマを管理します。テーマから投稿案を自動生成できます。"
        actions={
          <div className="flex items-center gap-2">
            {message && <span className="text-sm text-green-600">{message}</span>}
            <Button onClick={() => { setEditTarget(null); setIsFormOpen(true); }}>
              + テーマを追加
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : themes.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400">テーマがまだありません</p>
          <p className="mt-1 text-sm text-gray-400">「+ テーマを追加」から登録してみましょう</p>
          <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
            テーマを追加する
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onEdit={(t) => { setEditTarget(t); setIsFormOpen(true); }}
              onDelete={handleDelete}
              onGenerate={handleGenerate}
              generating={generatingId === theme.id}
            />
          ))}
        </div>
      )}

      {/* テーマ追加/編集 モーダル */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditTarget(null); }}
        title={editTarget ? 'テーマを編集' : 'テーマを追加'}
      >
        <ThemeForm
          initial={editTarget}
          onSubmit={handleSubmit}
          onCancel={() => { setIsFormOpen(false); setEditTarget(null); }}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
}
