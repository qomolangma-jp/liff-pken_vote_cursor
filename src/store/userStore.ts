import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, api, ApiError } from '@/lib/api';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface UserActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUser: (lineId: string) => Promise<void>;
  clearUser: () => void;
  reset: () => void;
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user, error: null }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error, loading: false }),

      fetchUser: async (lineId: string) => {
        const { loading } = get();
        if (loading) return;

        set({ loading: true, error: null });

        try {
          const user = await api.getMe(lineId);
          set({ 
            user: user.id !== 0 ? user : { ...user, id: 0 }, 
            loading: false, 
            initialized: true 
          });
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'ユーザー情報の取得に失敗しました';
          
          set({ 
            error: errorMessage, 
            loading: false, 
            initialized: true,
            user: { id: 0, line_id: lineId }
          });
        }
      },

      clearUser: () => set({ user: null, error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'user-store',
    }
  )
);
