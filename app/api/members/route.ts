import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const token = req.headers.get('Authorization') || '';

  try {
    const res = await fetch(`${API_URL}/users?search=${encodeURIComponent(query)}&limit=10`, {
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, message: 'Proxy error' }, { status: 500 });
  }
}
