import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Threads 金融教育 運用ボット',
  description: 'Threads向け金融教育コンテンツの半自動運用ツール',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
