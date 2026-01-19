'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60">
        <TopBar />
        <main className="pt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
