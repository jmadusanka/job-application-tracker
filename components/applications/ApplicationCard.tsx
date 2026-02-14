'use client';

import { useState } from 'react';
import { useApplications } from '@/context/ApplicationContext';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Briefcase, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
  application: JobApplication;
  onEdit?: (application: JobApplication) => void;
}

export function ApplicationCard({ application, onEdit }: ApplicationCardProps) {
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
    if (onEdit) {
      onEdit(application);
    }
    setShowActionMenu(false);
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    updateApplication(application.id, { status: newStatus });
    setShowStatusMenu(false);
  };

  const getStatusVariant = (status: ApplicationStatus | undefined): 'default' | 'warning' | 'success' | 'danger' => {
    switch (status) {
      case 'Analyzed':
        return 'default';
      case 'Interview':
        return 'warning';
      case 'Offer':
        return 'success';
      case 'Rejected':
        return 'danger';           // ← fixed: changed from "destructive" to "danger"
      default:
        return 'default';
    }
  };

  const getMatchColor = (score: number = 0) => {
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
          <h3 className="font-semibold text-slate-900 mb-1">
            {application.job_title || 'Untitled Application'}
          </h3>
          <p className="text-sm text-slate-600 font-medium">
            {application.company || 'Unknown Company'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge + Dropdown */}
          <div className="relative">
            <Badge
              variant={getStatusVariant(application.status)}
              className="cursor-pointer hover:opacity-80 text-xs px-2.5 py-0.5"
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusMenu((prev) => !prev);
              }}
            >
              {application.status ?? 'Analyzed'}
            </Badge>

            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 min-w-[120px] py-1 text-sm">
                {(['Analyzed', 'Applied', 'Interview', 'Offer', 'Rejected'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(status);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action menu (delete / edit) */}
          <div className="relative">
            <button
              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowActionMenu((prev) => !prev);
              }}
              title="More actions"
              aria-label="More actions"
            >
              <X className="w-4 h-4" />
            </button>

            {showActionMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 min-w-[120px] py-1 text-sm">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 transition-colors"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5 text-xs text-slate-600 mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{application.location || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{application.channel || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {application.application_date
              ? new Date(application.application_date).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'N/A'}
          </span>
        </div>
      </div>

      {/* Match Score */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-600 font-medium">Match Score</span>
        <span className={cn('text-lg font-bold', getMatchColor(application.analysis?.overallMatch ?? 0))}>
          {application.analysis?.overallMatch ?? 0}%
        </span>
      </div>
    </div>
  );
}