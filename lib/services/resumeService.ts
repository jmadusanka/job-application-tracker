import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export interface ResumeUploadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

// Upload and save resume file
export async function uploadResume(file: File): Promise<ResumeUploadResult> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    const filePath = path.join(uploadDir, fileName);
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    // Save file
    await writeFile(filePath, buffer);
    
    return {
      success: true,
      filePath: `/uploads/resumes/${fileName}`,
      fileName: fileName
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// Validate file type
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF and DOCX files are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }
  
  return { valid: true };
}