import { NextRequest, NextResponse } from 'next/server';
import { wpApi } from '@/lib/wp-api';

interface MeRequest {
  line_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MeRequest = await request.json();
    
    if (!body.line_id) {
      return NextResponse.json(
        { error: 'line_idが必要です' },
        { status: 400 }
      );
    }

    const user = await wpApi.getMe(body.line_id);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Me API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
