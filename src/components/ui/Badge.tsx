import React from 'react';

type Color = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'orange';

interface BadgeProps {
  color?: Color;
  children: React.ReactNode;
  className?: string;
}

const colorStyles: Record<Color, string> = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-700',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
};

export default function Badge({ color = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorStyles[color]} ${className}`}
    >
      {children}
    </span>
  );
}

// 投稿スタイル用
export function StyleBadge({ style }: { style: string }) {
  const map: Record<string, { label: string; color: Color }> = {
    short:      { label: '短文', color: 'blue' },
    standard:   { label: '標準', color: 'green' },
    passionate: { label: '熱量高め', color: 'orange' },
  };
  const s = map[style] ?? { label: style, color: 'gray' };
  return <Badge color={s.color}>{s.label}</Badge>;
}

// ステータス用
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: Color }> = {
    draft:    { label: '下書き', color: 'gray' },
    approved: { label: '承認済み', color: 'green' },
    posted:   { label: '投稿済み', color: 'blue' },
    archived: { label: 'アーカイブ', color: 'yellow' },
  };
  const s = map[status] ?? { label: status, color: 'gray' };
  return <Badge color={s.color}>{s.label}</Badge>;
}

// 優先度用
export function PriorityBadge({ priority }: { priority: number }) {
  const map: Record<number, { label: string; color: Color }> = {
    5: { label: '最高', color: 'red' },
    4: { label: '高', color: 'orange' },
    3: { label: '中', color: 'yellow' },
    2: { label: '低', color: 'gray' },
    1: { label: '最低', color: 'gray' },
  };
  const s = map[priority] ?? { label: String(priority), color: 'gray' };
  return <Badge color={s.color}>優先度: {s.label}</Badge>;
}
