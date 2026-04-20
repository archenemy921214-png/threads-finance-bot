import React from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const colorStyles = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   value: 'text-blue-700' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600', value: 'text-green-700' },
  yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600', value: 'text-yellow-700' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', value: 'text-purple-700' },
};

export default function StatsCard({ label, value, icon, color }: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div className={`rounded-xl ${styles.bg} p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <span className={`rounded-lg ${styles.icon} p-2`}>{icon}</span>
      </div>
      <p className={`mt-3 text-3xl font-bold ${styles.value}`}>{value}</p>
    </div>
  );
}
