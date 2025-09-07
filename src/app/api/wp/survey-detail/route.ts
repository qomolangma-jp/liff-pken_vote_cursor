import { NextRequest, NextResponse } from 'next/server';
import { wpApi } from '@/lib/wp-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const survey_id = searchParams.get('survey_id');

    if (!user_id || !survey_id) {
      return NextResponse.json(
        { error: 'user_idとsurvey_idが必要です' },
        { status: 400 }
      );
    }

    const survey = await wpApi.getSurveyDetail(Number(user_id), survey_id);
    return NextResponse.json(survey);
  } catch (error) {
    console.error('Survey Detail API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
