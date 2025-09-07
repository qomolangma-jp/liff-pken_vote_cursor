import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SurveyDetail, SurveyHistoryItem, api, ApiError } from '@/lib/api';

interface SurveyState {
  currentSurvey: SurveyDetail | null;
  surveyHistory: SurveyHistoryItem[];
  loading: boolean;
  error: string | null;
}

interface SurveyActions {
  setCurrentSurvey: (survey: SurveyDetail | null) => void;
  setSurveyHistory: (history: SurveyHistoryItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchSurveyDetail: (userId: number, surveyId: string) => Promise<void>;
  fetchSurveyHistory: (userId: number) => Promise<void>;
  submitSurveyReply: (data: Record<string, any>) => Promise<void>;
  clearCurrentSurvey: () => void;
  reset: () => void;
}

type SurveyStore = SurveyState & SurveyActions;

const initialState: SurveyState = {
  currentSurvey: null,
  surveyHistory: [],
  loading: false,
  error: null,
};

export const useSurveyStore = create<SurveyStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentSurvey: (survey) => set({ currentSurvey: survey, error: null }),

      setSurveyHistory: (history) => set({ surveyHistory: history, error: null }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error, loading: false }),

      fetchSurveyDetail: async (userId: number, surveyId: string) => {
        const { loading } = get();
        if (loading) return;

        set({ loading: true, error: null });

        try {
          const survey = await api.getSurveyDetail(userId, surveyId);
          set({ currentSurvey: survey, loading: false });
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'アンケート詳細の取得に失敗しました';
          
          set({ error: errorMessage, loading: false });
        }
      },

      fetchSurveyHistory: async (userId: number) => {
        const { loading } = get();
        if (loading) return;

        set({ loading: true, error: null });

        try {
          const history = await api.getSurveyHistory(userId);
          set({ surveyHistory: history, loading: false });
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'アンケート履歴の取得に失敗しました';
          
          set({ error: errorMessage, loading: false });
        }
      },

      submitSurveyReply: async (data: Record<string, any>) => {
        set({ loading: true, error: null });

        try {
          await api.submitSurveyReply(data);
          set({ loading: false });
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'アンケートの送信に失敗しました';
          
          set({ error: errorMessage, loading: false });
          throw error; // 呼び出し元でエラーハンドリングできるように再スロー
        }
      },

      clearCurrentSurvey: () => set({ currentSurvey: null, error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'survey-store',
    }
  )
);
