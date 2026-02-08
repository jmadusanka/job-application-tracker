'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JobApplication, NewApplicationInput } from '@/lib/types';
import { useSupabase } from '@/context/SupabaseProvider';

interface ApplicationContextType {
  applications: JobApplication[];
  selectedApplicationId: string | null;
  addApplication: (input: NewApplicationInput) => Promise<void>;
  updateApplication: (id: string, updates: Partial<JobApplication>) => Promise<void>;
  selectApplication: (id: string) => void;
  deleteApplication: (id: string) => Promise<void>;
  selectedApplication: JobApplication | null;
  loading: boolean;
  error: string | null;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { supabase, session } = useSupabase();

  const fetchApplications = async () => {
    if (!session?.user?.id || !supabase) {
      setApplications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('[ApplicationContext] Fetching applications for user:', session.user.id);

    const { data, error: fetchError } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('application_date', { ascending: false });

    if (fetchError) {
      console.error('[ApplicationContext] Fetch error:', fetchError);
      setError(fetchError.message);
    } else {
      const restored = (data || []).map((app: any) => ({
        ...app,
        applicationDate: new Date(app.application_date || app.applicationDate),
      }));
      console.log('[ApplicationContext] Fetched applications:', restored.length);
      setApplications(restored);

      // Auto-select first if none selected
      if (restored.length > 0 && !selectedApplicationId) {
        setSelectedApplicationId(restored[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();

    if (!session?.user?.id || !supabase) return;

    // Realtime subscription
    const channel = supabase
      .channel('job_applications_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          console.log('[ApplicationContext] Realtime change detected — refetching');
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, supabase]);

  const addApplication = async (input: NewApplicationInput) => {
    if (!session?.user?.id || !supabase) {
      throw new Error('Not authenticated or Supabase not available');
    }

    console.log('[ApplicationContext] Adding new application:', input.jobTitle);

    // Map camelCase form input → snake_case database columns
    const payload = {
      user_id: session.user.id,
      job_title: input.jobTitle,
      company: input.company,
      location: input.location,
      status: input.status,
      channel: input.channel,
      application_date: new Date().toISOString(),
      job_description: input.jobDescription,
      resume_name: input.resumeName,
      resume_text: input.resumeText,
      resume_file_path: input.resume_file_path,
      analysis: input.analysis || {}, // fallback if missing
    };

    const { data, error } = await supabase
      .from('job_applications')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[ApplicationContext] Supabase insert error:', error);
      console.error('[ApplicationContext] Payload sent:', payload);
      throw new Error(error.message || 'Failed to add application');
    }

    console.log('[ApplicationContext] Application added successfully:', data.id);

    // Update local state optimistically
    const newApp: JobApplication = {
      ...data,
      applicationDate: new Date(data.application_date),
    };
    setApplications((prev) => [newApp, ...prev]);
    setSelectedApplicationId(data.id);
  };

  const updateApplication = async (id: string, updates: Partial<JobApplication>) => {
    if (!supabase) throw new Error('Supabase not available');

    console.log('[ApplicationContext] Updating application:', id);

    // Map any camelCase updates to snake_case if needed
    const snakeUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      snakeUpdates[snakeKey] = value;
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update(snakeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[ApplicationContext] Update error:', error);
      throw error;
    }

    console.log('[ApplicationContext] Application updated:', data.id);

    // Update local state
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...data, applicationDate: new Date(data.application_date) } : app))
    );
  };

  const deleteApplication = async (id: string) => {
    if (!supabase) throw new Error('Supabase not available');

    console.log('[ApplicationContext] Deleting application:', id);

    const app = applications.find((a) => a.id === id);

    // Delete resume file from storage if exists
    if (app?.resume_file_path) {
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([app.resume_file_path]);

      if (storageError) {
        console.error('[ApplicationContext] Storage delete error:', storageError);
      } else {
        console.log('[ApplicationContext] Resume file deleted:', app.resume_file_path);
      }
    }

    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[ApplicationContext] Delete error:', error);
      throw error;
    }

    console.log('[ApplicationContext] Application deleted:', id);

    setApplications((prev) => prev.filter((a) => a.id !== id));

    if (selectedApplicationId === id) {
      setSelectedApplicationId(applications.find((a) => a.id !== id)?.id || null);
    }
  };

  const selectApplication = (id: string) => {
    console.log('[ApplicationContext] Selecting application:', id);
    setSelectedApplicationId(id);
  };

  const selectedApplication = applications.find((app) => app.id === selectedApplicationId) || null;

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        selectedApplicationId,
        addApplication,
        updateApplication,
        selectApplication,
        deleteApplication,
        selectedApplication,
        loading,
        error,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
}