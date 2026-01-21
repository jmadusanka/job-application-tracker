import { NextRequest, NextResponse } from 'next/server';

// POST resume upload
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Resume upload endpoint' });
}
