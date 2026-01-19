'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JobApplication, NewApplicationInput } from '@/lib/types';
import { generateMockApplications, createApplication } from '@/lib/mockData';

interface ApplicationContextType {
  applications: JobApplication[];
  selectedApplicationId: string | null;
  addApplication: (input: NewApplicationInput) => void;
  selectApplication: (id: string) => void;
  deleteApplication: (id: string) => void;
  selectedApplication: JobApplication | null;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Initialize with mock data
  useEffect(() => {
    const mockApps = generateMockApplications();
    setApplications(mockApps);
    // Auto-select first application
    if (mockApps.length > 0) {
      setSelectedApplicationId(mockApps[0].id);
    }
  }, []);

  const addApplication = (input: NewApplicationInput) => {
    const newApp = createApplication(input);
    setApplications(prev => [newApp, ...prev]);
    // Auto-select the newly created application
    setSelectedApplicationId(newApp.id);
  };

  const selectApplication = (id: string) => {
    setSelectedApplicationId(id);
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
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
