import { NextRequest, NextResponse } from 'next/server';

// GET all applications
export async function GET() {
  return NextResponse.json({ message: 'Get applications endpoint' });
}

// POST new application
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  return NextResponse.json({ message: 'Create application endpoint' });
}
