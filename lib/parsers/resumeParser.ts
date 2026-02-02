// lib/parsers/resumeParser.ts

import mammoth from 'mammoth';

export interface ParsedResume {
  text: string;
  fileName: string;
  fileType: string;
}

export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    console.log('[parsePDF] Starting pdf-parse. Buffer size:', buffer.length);

    // Dynamic import → bypasses all static ESM/TypeScript issues
    const pdf = (await import('pdf-parse')).default;

    if (typeof pdf !== 'function') {
      throw new Error('pdf-parse did not export a callable function');
    }

    const data = await pdf(buffer, {
      pagerender: (pageData: any) => {
        return pageData
          .getTextContent()
          .then((content: { items: Array<{ str: string }> }) => {
            const texts = content.items.map((item) => item.str.trim());
            return texts.filter(Boolean).join(' ');
          })
          .catch(() => '');
      },
    });

    let text = data.text.trim();

    console.log('[parsePDF] Extraction successful. Raw length:', text.length);

    if (text.length === 0) {
      console.warn('[parsePDF] No text extracted – possibly scanned/image PDF');
      text = '[No readable text found in PDF – possibly scanned/image-only]';
    } else if (text.length < 100) {
      console.warn('[parsePDF] Short text extracted:', text.length, 'chars');
    }

    return text;
  } catch (error) {
    console.error('[parsePDF] Failed:', error);
    return '[PDF parsing failed – try another file]';
  }
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    console.log('[parseDOCX] Starting mammoth. Buffer size:', buffer.length);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    console.log('[parseDOCX] Success. Length:', text.length);
    return text || '[No text in DOCX]';
  } catch (error) {
    console.error('[parseDOCX] Failed:', error);
    return '[DOCX error]';
  }
}

export async function parseResume(file: File): Promise<ParsedResume> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = '';
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    console.log(
      '[parseResume] File:',
      file.name,
      'Type:',
      file.type,
      'Size:',
      (file.size / 1024).toFixed(1),
      'KB'
    );

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      text = await parsePDF(buffer);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      text = await parseDOCX(buffer);
    } else {
      throw new Error('Only PDF and DOCX supported');
    }

    if (!text.trim()) {
      text = '[No readable text extracted]';
    }

    return {
      text,
      fileName: file.name,
      fileType: file.type,
    };
  } catch (error) {
    console.error('[parseResume] Critical error:', error);
    throw new Error('Resume processing failed – try another file');
  }
}