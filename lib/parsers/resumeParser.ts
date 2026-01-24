import * as pdfParse from 'pdf-parse';

export interface ParsedResume {
  text: string;
  fileName: string;
  fileType: string;
}

// Parse PDF file
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await (pdfParse as any)(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

// Parse DOCX file (placeholder - basic implementation)
export async function parseDOCX(buffer: Buffer): Promise<string> {
  // For POC, return a message. In production, install mammoth package
  return 'DOCX parsing not fully implemented. Please use PDF for now.';
}

// Main parser function
export async function parseResume(file: File): Promise<ParsedResume> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  let text = '';
  
  if (file.type === 'application/pdf') {
    text = await parsePDF(buffer);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await parseDOCX(buffer);
  } else {
    throw new Error('Unsupported file type');
  }
  
  return {
    text,
    fileName: file.name,
    fileType: file.type
  };
}