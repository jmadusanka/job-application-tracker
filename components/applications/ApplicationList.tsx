'use client';

import { useState } from 'react';
import { useApplications } from '@/context/ApplicationContext';
import { ApplicationCard } from './ApplicationCard';
import { NewApplicationForm } from './NewApplicationForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { JobApplication } from '@/lib/types';

export function ApplicationList() {
  const { applications } = useApplications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

  // Use snake_case properties from JobApplication type
  const filteredApplications = applications.filter(app => 
    (app.job_title?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
    (app.company?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </div>

      {showNewForm && (
        <div className="p-4 border-b">
          <NewApplicationForm onClose={() => setShowNewForm(false)} />
        </div>
      )}

      {editingApplication && (
        <div className="p-4 border-b">
          <NewApplicationForm 
            application={editingApplication} 
            onClose={() => setEditingApplication(null)} 
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No applications found</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard 
              key={application.id} 
              application={application} 
              onEdit={(app) => setEditingApplication(app)}
            />
          ))
        )}
      </div>
    </div>
  );
}