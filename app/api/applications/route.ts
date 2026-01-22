import { NextRequest, NextResponse } from 'next/server';

// GET all applications
export async function GET() {
  return NextResponse.json({ message: 'Get applications endpoint' });
}

// POST new application
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Create application endpoint' });
}
