'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useApplications } from '@/context/ApplicationContext';
import { useSupabase } from '@/context/SupabaseProvider';
import { NewApplicationInput, ApplicationStatus, ApplicationChannel } from '@/lib/types';
import { generateAnalysis } from '@/lib/analysis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Loader2 } from 'lucide-react';


interface NewApplicationFormProps {
  onClose: () => void;
}

interface PreviousCV {
  resume_name: string;
  resume_text: string;
  resume_file_path: string;
}

export function NewApplicationForm({ onClose }: NewApplicationFormProps) {
  const { addApplication } = useApplications();
  const { supabase, session } = useSupabase();

  const [formData, setFormData] = useState<Partial<NewApplicationInput>>({
    jobTitle: '',
    company: '',
    location: '',
    status: 'Analyzed' as ApplicationStatus,
    channel: 'Company Portal' as ApplicationChannel,
    jobDescription: '',
    resumeName: '',
    resumeText: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useExistingCV, setUseExistingCV] = useState(false);
  const [selectedExistingCV, setSelectedExistingCV] = useState("");
  const [previousCVs, setPreviousCVs] = useState<PreviousCV[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);

  // Fetch previously uploaded CVs from database
  useEffect(() => {
    const fetchPreviousCVs = async () => {
      if (!session?.user?.id || !supabase) return;

      setLoadingCVs(true);
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('resume_name, resume_text, resume_file_path')
          .eq('user_id', session.user.id)
          .not('resume_name', 'is', null)
          .not('resume_file_path', 'is', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[NewApplicationForm] Error fetching CVs:', error);
        } else if (data) {
          // Remove duplicates based on resume_file_path
          const uniqueCVs = data.reduce((acc: PreviousCV[], current) => {
            if (!acc.find(cv => cv.resume_file_path === current.resume_file_path)) {
              acc.push(current);
            }
            return acc;
          }, []);
          setPreviousCVs(uniqueCVs);
          console.log('[NewApplicationForm] Loaded', uniqueCVs.length, 'unique CVs');
        }
      } catch (err) {
        console.error('[NewApplicationForm] Failed to fetch CVs:', err);
      } finally {
        setLoadingCVs(false);
      }
    };

    fetchPreviousCVs();
  }, [session?.user?.id, supabase]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Please upload a PDF or DOC/DOCX file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, resumeName: file.name }));
      setErrorMessage(null);
    }
    setUseExistingCV(false);
    setSelectedExistingCV("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.jobTitle || !formData.company || !formData.location || !formData.jobDescription) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (!session?.user) {
      setErrorMessage('You must be logged in');
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    let resumeName = formData.resumeName || '';
    let resumeText = '';
    let resumeFilePath: string | undefined = undefined;

    // Handle resume selection/upload
    if (useExistingCV && selectedExistingCV) {
      // Find the selected CV from the previous CVs list
      const selectedCV = previousCVs.find(cv => cv.resume_file_path === selectedExistingCV);
      if (selectedCV) {
        resumeName = selectedCV.resume_name;
        resumeText = selectedCV.resume_text || '';
        resumeFilePath = selectedCV.resume_file_path;
        console.log('[NewApplicationForm] Using existing CV:', resumeName);
      } else {
        setErrorMessage('Selected CV not found');
        setUploading(false);
        return;
      }
    } else if (selectedFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('userId', session.user.id);

        const response = await fetch('/api/applications/upload-resume', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Upload failed');
        }

        const result = await response.json();
        resumeName = result.resumeName;
        resumeText = result.resumeText || '';
        resumeFilePath = result.resumeFilePath;

        console.log('[NewApplicationForm] Resume uploaded & parsed successfully');
      } catch (error: any) {
        console.error('Upload error:', error);
        setErrorMessage(error.message || 'Failed to upload resume. Please try again.');
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    setAnalyzing(true);

    // Run AI analysis
    let analysis;
    try {
      analysis = await generateAnalysis(
        formData.jobDescription || '',
        resumeName,
        resumeText,
        formData.jobTitle || ''
      );
      console.log('[NewApplicationForm] AI analysis completed');
    } catch (error) {
      console.error('Analysis error:', error);
      setErrorMessage('AI analysis failed. Please try again.');
      setAnalyzing(false);
      return;
    }

    // Save to Supabase
    try {
      await addApplication({
        jobTitle: formData.jobTitle,
        company: formData.company,
        location: formData.location,
        status: formData.status,
        channel: formData.channel,
        jobDescription: formData.jobDescription,
        resumeName,
        resumeText,
        resume_file_path: resumeFilePath,
        analysis,
      } as NewApplicationInput);

      console.log('[NewApplicationForm] Application saved successfully');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage('Failed to save application');
    } finally {
      setAnalyzing(false);
    }
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
                  value={formData.jobTitle ?? ''}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="e.g., TechCorp"
                  value={formData.company ?? ''}
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
                value={formData.location ?? ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full border rounded px-3 py-2"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                >
                  <option value="Analyzed">Analyzed</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel">Application Channel</Label>
                <select
                  id="channel"
                  className="w-full border rounded px-3 py-2"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as ApplicationChannel })}
                >
                  <option value="Company Portal">Company Portal</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Email">Email</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the full job description here..."
                value={formData.jobDescription ?? ''}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                className="min-h-[200px]"
                required
              />
              <p className="text-xs text-slate-500">
                The AI will analyze this description to extract required skills and generate match scores
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="existingCV">Use Previously Uploaded CV</Label>
              <select
                id="existingCV"
                className="w-full border rounded px-3 py-2"
                value={selectedExistingCV}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedExistingCV(val);
                  setUseExistingCV(!!val);
                  if (val) {
                    setSelectedFile(null);
                    const selectedCV = previousCVs.find(cv => cv.resume_file_path === val);
                    if (selectedCV) {
                      setFormData(prev => ({ ...prev, resumeName: selectedCV.resume_name }));
                    }
                  }
                }}
                disabled={loadingCVs}
              >
                <option value="">
                  {loadingCVs ? 'Loading...' : previousCVs.length === 0 ? '-- No previous CVs found --' : '-- Select a file --'}
                </option>
                {previousCVs.map((cv) => (
                  <option key={cv.resume_file_path} value={cv.resume_file_path}>
                    {cv.resume_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {previousCVs.length > 0 ? `${previousCVs.length} CV(s) available. Or upload a new file below.` : 'Upload a new file below.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeName">Resume</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="resumeName"
                  value={formData.resumeName || 'No file selected'}
                  readOnly
                  placeholder="No file selected"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('fileInput')?.click()}
                  disabled={uploading || analyzing || useExistingCV}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={useExistingCV}
                />
              </div>
              <p className="text-xs text-slate-500">
                Upload PDF or DOC file (max 5MB)
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={uploading || analyzing}>
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : uploading ? (
                  'Uploading...'
                ) : (
                  'Add Application'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={uploading || analyzing}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}