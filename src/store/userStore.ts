import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, api, ApiError } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';

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
          //console.log('fetchUser: APIレスポンス', user);

          if (!user || typeof user !== 'object') {
            set({ user: null, error: 'ユーザー情報が取得できませんでした' });
            //console.log('fetchUser: set後user(null)', get().user);
            return;
          }

          const userId = Number(user.id);
          if (userId && userId !== 0) {
            set({ user: { ...user, id: userId }, error: null });
            //console.log('fetchUser: set後user', get().user);
          } else {
            set({ user: null, error: null });
            //console.log('fetchUser: set後user(null)', get().user);
          }
        } catch (e) {
          set({ user: null, error: getErrorMessage(e) });
          console.log('fetchUser: エラー', e);
        } finally {
          set({ loading: false, initialized: true });
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
