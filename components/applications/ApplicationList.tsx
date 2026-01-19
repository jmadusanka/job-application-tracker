'use client';

import { useState } from 'react';
import { useApplications } from '@/context/ApplicationContext';
import { ApplicationCard } from './ApplicationCard';
import { NewApplicationForm } from './NewApplicationForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

export function ApplicationList() {
  const { applications } = useApplications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const filteredApplications = applications.filter(app =>
    app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {showNewForm && <NewApplicationForm onClose={() => setShowNewForm(false)} />}
      
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Applications ({applications.length})
          </h3>
          <Button
            size="sm"
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No applications found</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        )}
      </div>
    </div>
  );
}
