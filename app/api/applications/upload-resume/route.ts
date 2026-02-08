// app/api/applications/upload-resume/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseResume } from '@/lib/parsers/resumeParser'; // ← Fixed path (your project uses /parsers/ folder)

// Server-side Supabase client with service_role key (secure – bypasses RLS for server actions)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase env vars for server client');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF or DOCX allowed' }, { status: 400 });
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Generate unique safe filename
    const timestamp = Date.now();
    const safeName = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;
    const storagePath = `${userId}/${safeName}`;

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[upload-resume] Storage error:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    console.log('[upload-resume] File uploaded to:', storagePath);

    // Parse text server-side (your existing parseResume works perfectly here)
    const parsed = await parseResume(file);
    console.log('[upload-resume] Resume parsed – text length:', parsed.text.length);

    return NextResponse.json({
      success: true,
      resumeFilePath: storagePath,
      resumeName: file.name,
      resumeText: parsed.text,
    });
  } catch (error) {
    console.error('[upload-resume] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}