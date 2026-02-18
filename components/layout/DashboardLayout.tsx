'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

type DashboardLayoutProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60">
        <TopBar title={title} subtitle={subtitle} />
        <main className="pt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
