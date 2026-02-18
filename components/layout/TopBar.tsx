'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

type TopBarProps = {
  title?: string;
  subtitle?: string;
};

export function TopBar({
  title = 'Application Dashboard',
  subtitle = 'Track and analyze your job applications',
}: TopBarProps) {
  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 fixed top-0 left-60 right-0 z-10">
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <Badge variant="warning">AI Analysis Simulated</Badge>
        </div>
      </div>
    </div>
  );
}
