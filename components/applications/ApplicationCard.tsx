'use client';

import { useApplications } from '@/context/ApplicationContext';
import { JobApplication } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
  application: JobApplication;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { selectedApplicationId, selectApplication } = useApplications();
  const isSelected = selectedApplicationId === application.id;

  const getStatusVariant = (status: string) => {
    switch (status) {
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
        <Badge variant={getStatusVariant(application.status)}>
          {application.status}
        </Badge>
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
