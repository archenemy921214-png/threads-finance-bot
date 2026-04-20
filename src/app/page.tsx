'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/dashboard/StatsCard';
import Button from '@/components/ui/Button';
import { StyleBadge } from '@/components/ui/Badge';

interface Stats {
  draftCount: number;
  approvedCount: number;
  totalPosted: number;
  themeCount: number;
  recentHistory: RecentPost[];
}

interface RecentPost {
  id: number;
  theme_name: string | null;
  style: string | null;
  body: string;
  cta: string;
  hashtags: string;
  posted_at: string;
  likes: number;
  replies: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed');
      setStats(await res.json());
    } catch {
      console.error('統計の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setSeedMessage(data.message ?? 'サンプルデータを投入しました');
      await loadStats();
    } catch {
      setSeedMessage('投入に失敗しました');
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMessage(''), 3000);
    }
  }

  useEffect(() => { loadStats(); }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="ダッシュボード"
        subtitle="Threads 金融教育アカウントの運用状況"
        actions={
          <div className="flex items-center gap-2">
            {seedMessage && (
              <span className="text-sm text-green-600">{seedMessage}</span>
            )}
            <Button variant="secondary" size="sm" onClick={handleSeed} loading={seeding}>
              サンプルデータ投入
            </Button>
          </div>
        }
      />

      {/* 統計カード */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="下書き"
          value={stats?.draftCount ?? 0}
          color="yellow"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
            </svg>
          }
        />
        <StatsCard
          label="承認済み"
          value={stats?.approvedCount ?? 0}
          color="green"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label="投稿済み"
          value={stats?.totalPosted ?? 0}
          color="blue"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          }
        />
        <StatsCard
          label="テーマ数"
          value={stats?.themeCount ?? 0}
          color="purple"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
      </div>

      {/* クイックアクション */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">クイックアクション</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/themes">
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:border-blue-300">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">テーマを追加</p>
                <p className="text-xs text-gray-500">新しい投稿テーマを登録</p>
              </div>
            </div>
          </Link>
          <Link href="/drafts">
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:border-green-300">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">投稿を承認</p>
                <p className="text-xs text-gray-500">下書きを確認・承認する</p>
              </div>
            </div>
          </Link>
          <Link href="/history">
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:border-purple-300">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">反応を記録</p>
                <p className="text-xs text-gray-500">いいね・返信数を入力</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 最近の投稿 */}
      {stats && stats.recentHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">最近の投稿</h2>
          <div className="space-y-3">
            {stats.recentHistory.map((post) => {
              const hashtags: string[] = JSON.parse(post.hashtags || '[]');
              return (
                <div key={post.id} className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    {post.style && <StyleBadge style={post.style} />}
                    {post.theme_name && (
                      <span className="text-xs text-gray-400">📌 {post.theme_name}</span>
                    )}
                    <span className="ml-auto text-xs text-gray-400">{post.posted_at.slice(0, 10)}</span>
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm text-gray-700">{post.body}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.replies}</span>
                    <div className="flex gap-1">
                      {hashtags.map((t, i) => (
                        <span key={i} className="text-blue-400">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/history" className="mt-3 block text-center text-sm text-blue-600 hover:underline">
            すべての履歴を見る →
          </Link>
        </div>
      )}
    </div>
  );
}
