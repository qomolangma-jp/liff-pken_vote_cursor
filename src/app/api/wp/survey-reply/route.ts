import { NextRequest, NextResponse } from 'next/server';
import { wpApi } from '@/lib/wp-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    if (!body.user_id || !body.post_id) {
      return NextResponse.json(
        { error: 'user_idとpost_idが必要です' },
        { status: 400 }
      );
    }

    const result = await wpApi.submitSurveyReply(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Survey Reply API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
