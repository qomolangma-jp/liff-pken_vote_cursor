import { NextRequest, NextResponse } from 'next/server';
import { wpApi, RegisterRequest } from '@/lib/wp-api';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    
    // バリデーション
    if (!body.line_id || !body.email || !body.lastName || !body.firstName) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    const result = await wpApi.register(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
