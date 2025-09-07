import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiError, handleApiError, getErrorMessage } from './errorHandler';

// ApiErrorをエクスポート
export { ApiError } from './errorHandler';

// API クライアントの設定
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const apiError = handleApiError(error);
    throw apiError;
  }
);

// 型定義（wp-api.tsから再エクスポート）
export type {
  ApiResponse,
  User,
  RegisterRequest,
  SurveyForm,
  SurveyReply,
  SurveyDetail,
  SurveyHistoryItem,
} from './wp-api';

// API 関数（新しい構造に合わせて更新）
export const api = {
  // ユーザー情報取得
  async getMe(lineId: string): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>('/api/wp/me', {
        line_id: lineId,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ユーザー登録
  async register(data: RegisterRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/api/wp/register', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // アンケート詳細取得
  async getSurveyDetail(userId: number, surveyId: string): Promise<SurveyDetail> {
    try {
      const response = await apiClient.get<ApiResponse<SurveyDetail>>(
        `/api/wp/survey-detail?user_id=${userId}&survey_id=${surveyId}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // アンケート履歴取得
  async getSurveyHistory(userId: number): Promise<SurveyHistoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<SurveyHistoryItem[]>>(
        `/api/wp/survey-history?user_id=${userId}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // アンケート回答送信
  async submitSurveyReply(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/api/wp/survey-reply', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export { getErrorMessage };
