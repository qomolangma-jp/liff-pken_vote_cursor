import { NextRequest, NextResponse } from 'next/server';
import { wpApi } from '@/lib/wp-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_idが必要です' },
        { status: 400 }
      );
    }

    const history = await wpApi.getSurveyHistory(Number(user_id));
    return NextResponse.json(history);
  } catch (error) {
    console.error('Survey History API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
