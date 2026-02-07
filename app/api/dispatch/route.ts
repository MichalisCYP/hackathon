import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.SUPABASE_FUNCTION_URL;
  if (!url) return NextResponse.json({ error: 'SUPABASE_FUNCTION_URL not set' }, { status: 500 });

  const res = await fetch(`${url}/dispatch`, { method: 'GET' });
  const body = await res.json().catch(() => null);
  return NextResponse.json({ status: res.status, body });
}