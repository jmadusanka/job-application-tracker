'use client';

import { useSupabase } from '@/context/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const { supabase, session } = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const user = session?.user;

  return (
    <div className="w-60 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      {/* Brand */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">Job Tracker</h1>
        <p className="text-xs text-slate-400 mt-1">Analytics & Insights</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.user_metadata?.name || user?.email || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 bg-blue-600 rounded-md">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-slate-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}