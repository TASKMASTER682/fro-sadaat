import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization') || '';
  try {
    const res = await fetch(`${API_URL}/tree`, {
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, message: 'Proxy error' }, { status: 500 });
  }
}
