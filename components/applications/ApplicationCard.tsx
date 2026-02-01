'use client';

import { useApplications } from '@/context/ApplicationContext';
import { MoreVertical, X } from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ApplicationCardProps {
  application: JobApplication;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { selectedApplicationId, selectApplication, updateApplication, deleteApplication } = useApplications();
  const isSelected = selectedApplicationId === application.id;
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this application?')) {
      deleteApplication(application.id);
    }
    setShowActionMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement edit modal or navigation
    alert('Edit functionality coming soon!');
    setShowActionMenu(false);
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStatusMenu(!showStatusMenu);
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    updateApplication(application.id, { status: newStatus });
    setShowStatusMenu(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Analyzed':
        return 'default'; // Gray/neutral for analyzed
      case 'Interview':
        return 'warning';
      case 'Offer':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div
      onClick={() => selectApplication(application.id)}
      className={cn(
        'p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{application.jobTitle}</h3>
          <p className="text-sm text-slate-600 font-medium">{application.company}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Badge 
              variant={getStatusVariant(application.status)}
              className="cursor-pointer hover:opacity-80"
              onClick={handleStatusClick}
            >
              {application.status}
            </Badge>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[110px] py-1">
                <div
                  className="px-3 py-1.5 text-xs hover:bg-slate-100 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('Analyzed'); }}
                >
                  Analyzed
                </div>
                <div
                  className="px-3 py-1.5 text-xs hover:bg-slate-100 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('Applied'); }}
                >
                  Applied
                </div>
                <div
                  className="px-3 py-1.5 text-xs hover:bg-slate-100 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('Interview'); }}
                >
                  Interview
                </div>
                <div
                  className="px-3 py-1.5 text-xs hover:bg-slate-100 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('Offer'); }}
                >
                  Offer
                </div>
                <div
                  className="px-3 py-1.5 text-xs hover:bg-slate-100 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('Rejected'); }}
                >
                  Rejected
                </div>
              </div>
            )}
          </div>
          {/* Action menu (X icon) */}
          <div className="relative ml-2">
            <button
              className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-600"
              onClick={e => { e.stopPropagation(); setShowActionMenu(v => !v); }}
              title="Actions"
            >
              <X className="w-4 h-4" />
            </button>
            {showActionMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[110px] py-1">
                <div
                  className="px-3 py-1.5 text-xs hover:bg-slate-100 cursor-pointer text-red-600"
                  onClick={handleDelete}
                >
                  Delete
                </div>
                <div
                  className="px-3 py-1.5 text-xs hover:bg-slate-100 cursor-pointer"
                  onClick={handleEdit}
                >
                  Edit
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-500 mb-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>{application.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{application.channel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{application.applicationDate.toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-600">Match Score</span>
        <span className={cn('text-lg font-bold', getMatchColor(application.analysis.overallMatch))}>
          {application.analysis.overallMatch}%
        </span>
      </div>
    </div>
  );
}
