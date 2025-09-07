import axios, { AxiosError, AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';

// 型定義
export interface ApiResponse<T = any> {
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
  group?: {
    fm_title: string;
    fm_text: string;
  } | null;
  date?: string;
  form?: SurveyForm[];
  post?: {
    ID: number;
  };
  content?: string;
  my_reply?: SurveyReply;
}

export interface SurveyHistoryItem {
  id: number;
  title: string;
  date: string;
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
  private generateSignature(data: any): string {
  const rawBody = JSON.stringify(data);
  console.log('[DEBUG] generateSignature sharedSecret:', this.sharedSecret);
  console.log('[DEBUG] generateSignature rawBody:', rawBody);
  return CryptoJS.HmacSHA256(rawBody, this.sharedSecret).toString();
  }

  // 共通のリクエスト処理
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any,
    requiresSignature: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}/wp-json/custom/v1${endpoint}`;
    
    const config: any = {
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
    return this.request<SurveyHistoryItem[]>(
      `/survey_history?user_id=${userId}`
    );
  }

  // アンケート回答送信
  async submitSurveyReply(data: Record<string, any>): Promise<ApiResponse> {
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