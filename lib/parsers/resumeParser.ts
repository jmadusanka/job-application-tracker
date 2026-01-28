import mammoth from 'mammoth';

export interface ParsedResume {
  text: string;
  fileName: string;
  fileType: string;
}

// Parse PDF file
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    console.log('[parsePDF] Starting extraction with pdfreader. Buffer size:', buffer.length);

    // Dynamic import to avoid issues
    const { PdfReader } = await import('pdfreader');

    return new Promise((resolve, reject) => {
      let text = '';
      new PdfReader().parseBuffer(buffer, (err: unknown, item: unknown) => {
        if (err) {
          console.error('[parsePDF] Error during parsing:', err);
          reject(err);
        } else if (!item) {
          // End of file
          console.log('[parsePDF] Extraction successful. Total length:', text.length);
          resolve(text);
        } else if (typeof item === 'object' && item && 'text' in item) {
          // Accumulate text
          text += (item as { text: string }).text + ' ';
        }
      });
    });
  } catch (error) {
    console.error('[parsePDF] Critical Error:', error);
    return ''; // Return empty instead of throwing
  }
}

// Parse DOCX file
export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    console.log('[parseDOCX] Starting extraction. Buffer size:', buffer.length);
    const result = await mammoth.extractRawText({ buffer });
    console.log('[parseDOCX] Extraction successful. Text length:', result.value.length);
    return result.value;
  } catch (error) {
    console.error('[parseDOCX] Error:', error);
    return '';
  }
}

// Main parser function
export async function parseResume(file: File): Promise<ParsedResume> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let text = '';
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  console.log('[parseResume] Processing file:', file.name, 'Type:', file.type);

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    text = await parsePDF(buffer);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    text = await parseDOCX(buffer);
  } else {
    console.warn('[parseResume] Unsupported file type:', file.type);
    throw new Error('Unsupported file type. Please upload a PDF or DOCX.');
  }

  return {
    text,
    fileName: file.name,
    fileType: file.type
  };
}