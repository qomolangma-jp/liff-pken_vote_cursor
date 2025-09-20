import axios, { AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';

// 型定義
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  field?: string;
}

export interface User {
  id: number;
  name?: string;
  last_name?: string;
  first_name?: string;
  last_kana?: string;
  first_kana?: string;
  email?: string;
  line_id: string;
}

export interface RegisterRequest {
  grade: number;
  class: number;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  email: string;
  line_id: string;
}

export interface SurveyForm {
  fm_label: string;
  fm_type: 'text' | 'textarea' | 'radio' | 'select' | 'checkbox';
  fm_value?: string;
}

export interface SurveyReply {
  fm_re_id: string;
  user_id: string;
  post_id: string;
  answer: string;
  str: string;
  history: Record<string, unknown> | null;
  created: string;
  updated: string | null;
}

export interface SurveyDetail {
  ok: boolean;
  post: {
    id: number;
    title: string;
    content: string;
    date: string;
    post_status: string;
    post_author: number;
    group: {
      fm_title: string;
      fm_text: string;
      fm_close: string;
    };
    form: SurveyForm[];
  };
  my_reply: {
    fm_re_id: number | null;
    user_id: number;
    reply_status: string | null;
    answer: string | null;
    form_data: object | null;
    history: string | null;
    line_date: string | null;
    reply_created: string | null;
    reply_updated: string | null;
  };
}

// WordPressのAPIレスポンス構造に合わせた型定義
export interface WordPressSurveyResponse {
  ok: boolean;
  count: number;
  data: WordPressSurveyItem[];
}

export interface WordPressSurveyItem {
  id: number;
  title: string;
  date: string;
  post_status: string;
  reply: {
    fm_re_id: number | null;
    user_id: number;
    reply_status: string | null; // 'answered' | 'unanswered' | null
    answer: string | null;
    form_data: object | null;
    history: string | null;
    line_date: string | null;
    reply_created: string | null;
    reply_updated: string | null;
  };
}

export interface SurveyHistoryItem {
  id: number;
  title: string;
  date: string;
  // フロントエンド用の統一されたフィールド
  status?: string; // reply.reply_statusから取得
  replyDate?: string; // reply.reply_updatedまたはreply.reply_createdから取得
  // WordPressの生データも保持
  post_status?: string;
  reply?: WordPressSurveyItem['reply'];
  // 下位互換性のための追加フィールド
  fm_re_id?: number;
  user_id?: number;
  post_id?: number;
  answer?: string;
  str?: string;
  history?: string;
  line_date?: string;
  created?: string;
  updated?: string;
}

// LIFF関連の型定義
export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LiffState {
  ready: boolean;
  profile?: LiffProfile;
  error?: string;
  mock?: boolean;
}

// WordPress API クライアント
class WordPressApiClient {
  private baseUrl: string;
  private sharedSecret: string;

  constructor() {
  this.baseUrl = process.env.NEXT_PUBLIC_WP_API_BASE || 'http://localhost:8080/pken-dev_vote';
  this.sharedSecret = process.env.CUR_SHARED_SECRET || process.env.NEXT_PUBLIC_CUR_SHARED_SECRET || '';
  }

  // 署名生成
  private generateSignature(data: Record<string, unknown> | RegisterRequest): string {
  const rawBody = JSON.stringify(data);
  console.log('[DEBUG] generateSignature sharedSecret:', this.sharedSecret);
  console.log('[DEBUG] generateSignature rawBody:', rawBody);
  return CryptoJS.HmacSHA256(rawBody, this.sharedSecret).toString();
  }

  // 共通のリクエスト処理
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: Record<string, unknown> | RegisterRequest,
    requiresSignature: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}/wp-json/custom/v1${endpoint}`;
    
    const config: {
      method: string;
      url: string;
      headers: Record<string, string>;
      data?: Record<string, unknown> | RegisterRequest;
    } = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
      
      if (requiresSignature) {
        config.headers['X-Signature'] = this.generateSignature(data);
      }
    }

    try {
      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error || 
          error.message || 
          'WordPress API エラーが発生しました'
        );
      }
      throw error;
    }
  }

  // ユーザー情報取得
  async getMe(lineId: string): Promise<User> {
    return this.request<User>('/me', 'POST', { line_id: lineId });
  }

  // ユーザー登録
  async register(data: RegisterRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>('/register', 'POST', data, true);
  }

  // アンケート詳細取得
  async getSurveyDetail(userId: number, surveyId: string): Promise<SurveyDetail> {
    return this.request<SurveyDetail>(
      `/survey_detail?user_id=${userId}&survey_id=${surveyId}`
    );
  }

  // アンケート履歴取得
  async getSurveyHistory(userId: number): Promise<SurveyHistoryItem[]> {
    const response = await this.request<WordPressSurveyResponse>(
      `/survey_history?user_id=${userId}`
    );
    
    // デバッグ用: WordPressからの生レスポンスをログ出力
    console.log('Raw WordPress Survey History Response:', JSON.stringify(response, null, 2));
    
    // WordPressのレスポンス構造をフロントエンド用の構造に変換
    const mappedData = response.data.map(item => {
      // 実際に回答データがあるかチェック
      const hasActualAnswer = item.reply.fm_re_id && 
        (item.reply.answer || item.reply.form_data || item.reply.reply_status === 'answered');
      
      console.log(`Survey ${item.id}: hasActualAnswer=${hasActualAnswer}, fm_re_id=${item.reply.fm_re_id}, reply_status=${item.reply.reply_status}, answer=${!!item.reply.answer}, form_data=${!!item.reply.form_data}`);
      
      return {
        id: item.id,
        title: item.title,
        date: item.date,
        status: item.reply.reply_status || 'unanswered', // reply_statusがnullの場合は未回答
        post_status: item.post_status,
        reply: item.reply,
        // 回答日時を設定（実際に回答がある場合のみ）
        replyDate: hasActualAnswer ? (item.reply.reply_updated || item.reply.reply_created || undefined) : undefined,
        // 下位互換性のための追加フィールド
        fm_re_id: item.reply.fm_re_id || undefined,
        user_id: item.reply.user_id,
        post_id: item.id,
        answer: item.reply.answer || undefined,
        str: item.reply.form_data ? JSON.stringify(item.reply.form_data) : undefined,
        history: item.reply.history || undefined,
        line_date: item.reply.line_date || undefined,
        created: item.reply.reply_created || undefined,
        updated: item.reply.reply_updated || undefined,
      };
    });
    
    console.log('Mapped data sample:', mappedData[0]);
    return mappedData;
  }

  // アンケート回答送信
  async submitSurveyReply(data: Record<string, string | number>): Promise<ApiResponse> {
    return this.request<ApiResponse>('/survey_reply', 'POST', data, true);
  }

}

// シングルトンインスタンス
export const wpApi = new WordPressApiClient();

// エクスポート
export { WordPressApiClient };

console.log('[DEBUG] process.cwd():', process.cwd());
console.log('[DEBUG] __dirname:', __dirname);
console.log('[DEBUG] process.env.CUR_SHARED_SECRET:', process.env.CUR_SHARED_SECRET);
console.log('[DEBUG] process.env.NEXT_PUBLIC_CUR_SHARED_SECRET:', process.env.NEXT_PUBLIC_CUR_SHARED_SECRET);
console.log('[DEBUG] process.env.NEXT_PUBLIC_WP_API_BASE:', process.env.NEXT_PUBLIC_WP_API_BASE);
console.log('[DEBUG] wpApi baseUrl:', wpApi); 