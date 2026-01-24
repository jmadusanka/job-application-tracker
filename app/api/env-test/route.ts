// app/api/debug-env/route.ts
export async function GET() {
  return Response.json({
    message: "Env debug endpoint",
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    supabaseUrl: process.env.SUPABASE_URL || 'MISSING',
    hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
    anonKeyLength: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : 'MISSING',
    geminiKey: process.env.GEMINI_API_KEY ? 'EXISTS (length ' + process.env.GEMINI_API_KEY.length + ')' : 'MISSING',
    allRelevantKeys: Object.keys(process.env).filter(k => 
      k.includes('SUPABASE') || k === 'GEMINI_API_KEY' || k === 'NODE_ENV'
    ),
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
    timestamp: new Date().toISOString()
  })
}