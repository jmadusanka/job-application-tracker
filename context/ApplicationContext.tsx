'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JobApplication, NewApplicationInput } from '@/lib/types';
import { generateMockApplications } from '@/lib/analysis'; // Renamed from mockData
import { createApplication } from '@/lib/analysis'; // Updated to async

interface ApplicationContextType {
  applications: JobApplication[];
  selectedApplicationId: string | null;
  addApplication: (input: NewApplicationInput) => void;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  selectApplication: (id: string) => void;
  deleteApplication: (id: string) => void;
  selectedApplication: JobApplication | null;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

useEffect(() => {
  // Try to load from localStorage first
  const saved = localStorage.getItem('jobApplications');
  
  if (saved) {
    // Parse and restore dates
    const parsed = JSON.parse(saved);
    const restoredApps = parsed.map((app: any) => ({
      ...app,
      applicationDate: new Date(app.applicationDate)
    }));
      queueMicrotask(() => {
    setApplications(restoredApps);
    if (restoredApps.length > 0) {
      setSelectedApplicationId(restoredApps[0].id);
    }
      });
  } else {
    // First time - use mock data
    const mockApps = generateMockApplications();
    setApplications(mockApps);
    localStorage.setItem('jobApplications', JSON.stringify(mockApps));
    if (mockApps.length > 0) {
      setSelectedApplicationId(mockApps[0].id);
    }
  }
}, []);

  const addApplication = (input: NewApplicationInput) => {
    const newApp = createApplication(input);
    setApplications(prev => {
      const updated = [newApp, ...prev];
      localStorage.setItem('jobApplications', JSON.stringify(updated));
      return updated;
    });
    // Auto-select the newly created application
    setSelectedApplicationId(newApp.id);
  };

  const selectApplication = (id: string) => {
    setSelectedApplicationId(id);
  };

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    setApplications(prev => {
      const updated = prev.map(app => 
        app.id === id ? { ...app, ...updates } : app
      );
      localStorage.setItem('jobApplications', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => {
      const updated = prev.filter(app => app.id !== id);
      localStorage.setItem('jobApplications', JSON.stringify(updated));
      return updated;
    });
    if (selectedApplicationId === id) {
      setSelectedApplicationId(null);
    }
  };

  const selectedApplication = applications.find(app => app.id === selectedApplicationId) || null;

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        selectedApplicationId,
        addApplication,
        updateApplication,
        selectApplication,
        deleteApplication,
        selectedApplication
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