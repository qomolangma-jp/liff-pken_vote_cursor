import { SurveyHistoryItem } from '@/lib/wp-api';

export type SurveyStatus = 'answered' | 'unanswered' | 'pending';

/**
 * WordPressのmy_form_reply_historyテーブルから返されるアンケート履歴データから回答状況を判別する
 * @param survey アンケート履歴データ
 */
export function determineSurveyStatus(survey: SurveyHistoryItem): SurveyStatus {
  // デバッグ用: サーベイデータをコンソールに出力
  console.log('Survey data for status determination:', survey);

  // 1. statusフィールドから直接判別（WordPressのAPIで変換済み）
  if (survey.status) {
    const status = survey.status.toLowerCase();
    console.log(`Survey status field: ${status}`);
    
    switch (status) {
      case 'answered':
        return 'answered';
      case 'unanswered':
        return 'unanswered';
      default:
        // その他の状態は保留中として扱う
        return 'pending';
    }
  }

  // 2. replyオブジェクトから判別
  if (survey.reply) {
    console.log('Checking reply object:', survey.reply);
    
    if (survey.reply.reply_status) {
      const replyStatus = survey.reply.reply_status.toLowerCase();
      console.log(`Reply status: ${replyStatus}`);
      
      switch (replyStatus) {
        case 'answered':
          return 'answered';
        case 'unanswered':
          return 'unanswered';
        default:
          return 'pending';
      }
    }
    
    // reply_statusがnullでも、実際の回答データがあるかチェック
    if (survey.reply.fm_re_id && (survey.reply.answer || survey.reply.form_data)) {
      console.log('Has fm_re_id and actual answer data, marking as answered');
      return 'answered';
    }
    
    // fm_re_idがあっても回答データがない場合は未回答
    if (survey.reply.fm_re_id && !survey.reply.answer && !survey.reply.form_data) {
      console.log('Has fm_re_id but no answer data, marking as unanswered');
      return 'unanswered';
    }
  }

  // 3. 下位互換性: answerフィールドやstrフィールドの有無で判別
  if (survey.answer && survey.answer.trim() !== '') {
    console.log('Status determined by answer field: answered');
    return 'answered';
  }
  
  if (survey.str) {
    try {
      const parsed = JSON.parse(survey.str);
      if (Object.keys(parsed).length > 0) {
        console.log('Status determined by str field with data: answered');
        return 'answered';
      }
    } catch {
      // JSON解析に失敗した場合は、strが空でなければ回答ありとみなす
      if (survey.str.trim() !== '') {
        console.log('Status determined by non-empty str field: answered');
        return 'answered';
      }
    }
  }

  // デフォルトは未回答
  console.log('Default status: unanswered');
  return 'unanswered';
}

/**
 * アンケート履歴配列にステータスを設定する
 * @param surveys アンケート履歴配列
 */
export function mapSurveyHistoryWithStatus(surveys: SurveyHistoryItem[]): (SurveyHistoryItem & { status: SurveyStatus })[] {
  return surveys.map(survey => ({
    ...survey,
    status: determineSurveyStatus(survey)
  }));
}