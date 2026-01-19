'use client';

import { useState, FormEvent } from 'react';
import { useApplications } from '@/context/ApplicationContext';
import { NewApplicationInput, ApplicationStatus, ApplicationChannel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload } from 'lucide-react';

interface NewApplicationFormProps {
  onClose: () => void;
}

export function NewApplicationForm({ onClose }: NewApplicationFormProps) {
  const { addApplication } = useApplications();
  const [formData, setFormData] = useState<Partial<NewApplicationInput>>({
    jobTitle: '',
    company: '',
    location: '',
    status: 'Applied',
    channel: 'Company Portal',
    jobDescription: '',
    resumeName: 'resume.pdf'
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobTitle || !formData.company || !formData.location || !formData.jobDescription) {
      alert('Please fill in all required fields');
      return;
    }

    addApplication(formData as NewApplicationInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>New Job Application</CardTitle>
              <CardDescription>Add a new job application to track</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Frontend Developer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="e.g., TechCorp"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA or Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel">Application Channel</Label>
                <Select
                  id="channel"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as ApplicationChannel })}
                >
                  <option value="Company Portal">Company Portal</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Email">Email</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the full job description here..."
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                className="min-h-[200px]"
                required
              />
              <p className="text-xs text-slate-500">
                The AI will analyze this description to extract required skills and generate match scores
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeName">Resume</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="resumeName"
                  value={formData.resumeName}
                  onChange={(e) => setFormData({ ...formData, resumeName: e.target.value })}
                  placeholder="resume.pdf"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Browse
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Note: Resume upload is simulated in this POC
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Add Application
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
