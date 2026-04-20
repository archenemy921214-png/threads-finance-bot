'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { StyleBadge } from '@/components/ui/Badge';

interface HistoryItem {
  id: number;
  theme_name: string | null;
  style: string | null;
  body: string;
  cta: string;
  hashtags: string[];
  posted_at: string;
  likes: number;
  replies: number;
  memo: string | null;
  improvement: string | null;
}

interface ReactionForm {
  likes: number;
  replies: number;
  memo: string;
  improvement: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<HistoryItem | null>(null);
  const [form, setForm] = useState<ReactionForm>({ likes: 0, replies: 0, memo: '', improvement: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  async function loadHistory() {
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error('Failed');
      setHistory(await res.json());
    } catch {
      showMessage('履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function openEdit(item: HistoryItem) {
    setEditTarget(item);
    setForm({
      likes: item.likes,
      replies: item.replies,
      memo: item.memo ?? '',
      improvement: item.improvement ?? '',
    });
  }

  async function handleSave() {
    if (!editTarget) return;
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/history/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setEditTarget(null);
      showMessage('反応メモを保存しました');
      await loadHistory();
    } catch {
      showMessage('保存に失敗しました');
    } finally {
      setSaveLoading(false);
    }
  }

  useEffect(() => { loadHistory(); }, []);

  return (
    <div>
      <Header
        title="投稿履歴"
        subtitle="投稿済みコンテンツの実績と反応を管理します"
        actions={message ? <span className="text-sm text-green-600">{message}</span> : undefined}
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400">投稿履歴がありません</p>
          <p className="mt-1 text-sm text-gray-400">
            投稿候補ページで「投稿済みにする」と履歴に追加されます
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="rounded-xl border bg-white p-5 shadow-sm">
              {/* ヘッダー */}
              <div className="mb-3 flex items-center gap-2">
                {item.style && <StyleBadge style={item.style} />}
                {item.theme_name && (
                  <span className="text-sm text-gray-500">📌 {item.theme_name}</span>
                )}
                <span className="ml-auto text-sm text-gray-400">{item.posted_at.slice(0, 10)}</span>
              </div>

              {/* 本文 */}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{item.body}</p>

              {/* CTA */}
              <p className="mt-2 text-sm font-medium text-blue-600">→ {item.cta}</p>

              {/* ハッシュタグ */}
              <div className="mt-2 flex flex-wrap gap-1">
                {item.hashtags.map((tag, i) => (
                  <span key={i} className="text-xs text-blue-500">{tag}</span>
                ))}
              </div>

              {/* 反応データ */}
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3">
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">❤️ <strong>{item.likes}</strong></span>
                  <span className="text-gray-600">💬 <strong>{item.replies}</strong></span>
                </div>

                {item.memo && (
                  <div className="flex-1 rounded-lg bg-yellow-50 px-3 py-1.5 text-xs text-yellow-800">
                    📝 {item.memo}
                  </div>
                )}

                <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="ml-auto">
                  反応を記録
                </Button>
              </div>

              {/* 改善案 */}
              {item.improvement && (
                <div className="mt-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-800">
                  💡 改善案: {item.improvement}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 反応記録 モーダル */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="反応メモを記録"
      >
        <div className="space-y-4">
          {/* いいね・返信数 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">❤️ いいね数</label>
              <input
                type="number"
                min={0}
                value={form.likes}
                onChange={(e) => setForm((f) => ({ ...f, likes: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">💬 返信数</label>
              <input
                type="number"
                min={0}
                value={form.replies}
                onChange={(e) => setForm((f) => ({ ...f, replies: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">📝 メモ</label>
            <textarea
              rows={3}
              value={form.memo}
              onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
              placeholder="反応の感想や気づきを自由に..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 改善案 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">💡 改善案</label>
            <textarea
              rows={3}
              value={form.improvement}
              onChange={(e) => setForm((f) => ({ ...f, improvement: e.target.value }))}
              placeholder="次回の改善点や試してみたいことを..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave} loading={saveLoading}>
              保存する
            </Button>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
